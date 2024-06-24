import Demande from '../models/Demande.js';  // Remplacer DemandeHebergement par Demande
import moment from 'moment'; // Pour la gestion des dates
import schedule from 'node-schedule';
import mongoose from 'mongoose';
import axios from 'axios';
import nodemailer from 'nodemailer';
import AttributionChambre from '../models/AttributionChambre.js';  // Remplacer DemandeHebergement par Demande

export const createDemande = async (req, res) => {
  try {
    const { utilisateur,email, foyer, typeDemande } = req.body;
    console.log("body", req.body);
    const currentYear = moment().year();
    console.log(`Recherche de demande pour l'utilisateur: ${utilisateur}, type: ${typeDemande}, entre ${new Date(`${currentYear}-01-01`)} et ${new Date(`${currentYear + 1}-01-01`)}`);
 
    // Vérifier si l'utilisateur a déjà une demande pour l'année universitaire en cours
    const existingDemande = await Demande.findOne({
      utilisateur,
      typeDemande,
      dateDemande: { $gte: new Date(`${currentYear}-01-01`), $lt: new Date(`${currentYear + 1}-01-01`) }
    });
    console.log(`Demande existante: ${existingDemande}`);

    if (existingDemande) {
      return res.status(400).json({ message: "Vous avez déjà une demande pour cette année universitaire." });
    }updateStatutDemande

    const nouvelleDemande = new Demande({
      ...req.body,
      statutDemande: 'En attente',
      dateDemande: new Date(),
    });

    await nouvelleDemande.save();
    res.status(201).json(nouvelleDemande);
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la création de la demande", error });
  }
};

export const getAllDemandes = async (req, res) => {
  try {
    const demandes = await Demande.find().populate('foyer');
    res.status(200).json(demandes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des demandes", error });
  }
};
export const getDemandeById = async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id).populate('foyer');
    if (!demande) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }
    res.status(200).json(demande);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de la demande", error });
  }
};
export const checkExistingDemand = async (req, res) => {
  const { utilisateur } = req.params;
  console.log("req.params", req.params );
  const currentYear = moment().year();

  try {
      const existingDemande = await Demande.findOne({
          utilisateur,
          dateDemande: {
              $gte: new Date(`${currentYear}-01-01`),
              $lt: new Date(`${currentYear + 1}-01-01`)
          }
      });

      if (existingDemande) {
          return res.status(200).json({ exist: true, message: "Demande already exists for this academic year." });
      } else {
          return res.status(200).json({ exist: false, message: "No existing demande found for this academic year." });
      }
  } catch (error) {
      console.error('Failed to check existing demands:', error);
      res.status(500).json({ message: "Server error while checking for existing demands." });
  }
};

export const getDemandIdByUserId = async (req, res) => {
  const { utilisateur } = req.params; // Get the user ID from the URL parameter

  try {
      const existingDemande = await Demande.findOne({ utilisateur });

      if (existingDemande) {
          return res.status(200).json({
              demandId: existingDemande._id,
              cin: existingDemande.cin,
              photo: existingDemande.photo,
              attestationInscription: existingDemande.attestationInscription,
              certificatMedical: existingDemande.certificatMedical
          });
      } else {
          return res.status(404).json({ message: "Vous n'avez pas encore fait une demande" });
      }
  } catch (error) {
      console.error('Error retrieving demand by user ID:', error);
      res.status(500).json({ message: "Server error while retrieving demand." });
  }
};

// Fonction pour vérifier les documents apres 7jrs et mettre à jour le statut
const verifierDocumentsDemandes = async () => {
  console.log("Vérification des documents pour les demandes...");
  try {
    const uneSemaineAvant = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const demandes = await Demande.find({
      dateDemande: { $lte: uneSemaineAvant },
      statutDemande: 'Approuvée', // Assurez-vous de vérifier uniquement les demandes 'En attente'
      $or: [
        { cin: { $exists: false } },
        { photo: { $exists: false } },
        { attestationInscription: { $exists: false } },
        { certificatMedical: { $exists: false } }
      ]
    });

    if (demandes.length > 0) {
      console.log(`Mise à jour de ${demandes.length} demandes...`);
      await Promise.all(
        demandes.map(async (demande) => {
          demande.statutDemande = 'Rejetée';
          await demande.save();

          const attribution = await AttributionChambre.findOne({ demande: demande._id }).populate('chambre');
          if (attribution && attribution.chambre) {
            const chambre = attribution.chambre;
            chambre.placesDispo += 1;
            chambre.statut = 'Disponible';
            await chambre.save();
            console.log(`Chambre ${chambre.num} updated: placesDispo = ${chambre.placesDispo}, statut = Disponible`);
          }
        })
      );
      console.log("Mises à jour terminées.");
    } else {
      console.log("Aucune demande nécessitant une mise à jour.");
    }
  } catch (error) {
    console.error("Erreur lors de la vérification des demandes:", error);
  }
};
// Planifier la tâche pour s'exécuter chaque jour à minuit
//schedule.scheduleJob('* * * * *', verifierDocumentsDemandes);



// Fonction pour vérifier les demandes et envoyer un email si elles sont incomplètes après 5 jours
export const checkAndNotifyIncompleteDemandes = async () => {
  console.log("Vérification et notification des demandes incomplètes...");
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ons.benamorr@gmail.com',
      pass: 'balj ctus kuar ivbm',
    },
  });

  const emailMessages = [];

  try {
    const cinqJoursAvant = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const demandes = await Demande.find({
      dateDemande: { $lte: cinqJoursAvant },
      statutDemande: 'Approuvée',
      typeDemande: 'Hebergement',
      $or: [
        { cin: { $exists: false } },
        { photo: { $exists: false } },
        { attestationInscription: { $exists: false } },
        { certificatMedical: { $exists: false } }
      ]
    });

    if (demandes.length > 0) {
      console.log(`Envoi de notifications pour ${demandes.length} demandes...`);
      await Promise.all(
        demandes.map(async (demande) => {
          const emailBody = `
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
              <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="cid:logo" style="max-width: 200px;" alt="Logo"/>
                </div>
                <h2 style="color: #bd081c; text-align: center;">Dernier rappel</h2>
                <h3 style="color: #e74c3c; text-align: center;">Avis Important</h3>
                <p>Bonjour ${demande.utilisateur},</p>
                <p>Nous vous informons que votre demande d'hébergement est toujours en attente de téléchargement des documents requis qui vous ont été préalablement notifiés et vous rappeler de l'obligation de déposer les documents ci-dessous dans le lien suivant.</p>
                <h4>Dossier numérique</h4>
              
                  <li>Reçu de paiement des frais d'hébergement</li>
                  <li>Photo</li>
                  <li>Attestation de réussite / inscription</li>
                  <li>Copie CIN ou Passeport</li>
                  <li>Certificat médical attestant de la capacité de vivre au foyer</li>
                  <li>Contrat signé</li>
                  <li>Règlement intérieur signé</li>
                </ul>
                <h4>Règlement du loyer</h4>
                <p>- Paiement loyer intégral 2700dt résidence externe 2600dt foyer interne (paiement en deux tranches, l'une à l'inscription et l'autre à la fin de janvier)</p>
                <p>- Caution 270dt résidence 250dt foyer (à payer à l'inscription)</p>
                <p>Vous devez joindre les documents requis avant demain, et en cas de non-respect votre réservation sera automatiquement suspendue et définitivement.</p>
                <p>Merci pour votre compréhension.</p>
              </div>
            </body>
            </html>
          `;

          // Envoyer l'e-mail
          await transporter.sendMail({
            from: 'ons.benamorr@gmail.com',
            to: demande.email,
            subject: 'Documents manquants pour votre demande d\'hébergement',
            html: emailBody,
          });

          const message = `E-mail envoyé à l'utilisateur ${demande.email} avec succès`;
          console.log(message);
          emailMessages.push(message);
        })
      );
    } else {
      console.log("Aucune demande nécessitant une notification.");
      emailMessages.push("Aucune demande nécessitant une notification.");
    }
  } catch (error) {
    console.error("Erreur lors de la vérification et de la notification des demandes:", error);
    emailMessages.push("Erreur lors de la vérification et de la notification des demandes.");
  }

  return emailMessages;
};

// Schedule the job to run every day at midnight
//schedule.scheduleJob('* * * * *', checkAndNotifyIncompleteDemandes);


// Fonction pour vérifier les demandes à finaliser
export const finalizeDemande = async (accessToken) => {
  console.log("Vérification des demandes à finaliser...");
  console.log("accessToken", accessToken);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ons.benamorr@gmail.com',
      pass: 'balj ctus kuar ivbm',
    },
  });

  try {
    const demandes = await Demande.find({
      statutDemande: 'Approuvée',
      typeDemande: { $in: ['Hebergement', 'Renouvellement'] },
    });

    if (demandes.length > 0) {
      console.log(`Finalisation de ${demandes.length} demandes...`);
      await Promise.all(
        demandes.map(async (demande) => {
          let hasAllDocuments = demande.typeDemande === 'Hebergement';
          let userRenouvEmail = null;

          if (demande.typeDemande === 'Renouvellement' && demande.demandeOriginale) {
            const demandeOriginale = await Demande.findById(demande.demandeOriginale);
            if (demandeOriginale) {
              hasAllDocuments = ['cin', 'photo', 'attestationInscription', 'certificatMedical'].every(doc => !!demandeOriginale[doc]);
              userRenouvEmail = demandeOriginale.email;
              console.log("Renouvellement email: ", userRenouvEmail);
            }
          } else {
            hasAllDocuments = ['cin', 'photo', 'attestationInscription', 'certificatMedical'].every(doc => !!demande[doc]);
          }

          if (!hasAllDocuments) {
            console.log(`La demande ${demande._id} n'a pas tous les documents nécessaires.`);
            return;
          }

          const userEmail = demande.email;
          console.log("User email: ", userEmail);

          const emailBody = `
            <html>
            <body>
              <p>Bonjour,</p>
              <p>Félicitations, votre demande d'hébergement a été finalisée avec succès !</p>
              <p>Merci pour votre patience.</p>
            </body>
            </html>
          `;

          if (userEmail) {
            await transporter.sendMail({
              from: 'ons.benamorr@gmail.com',
              to: userEmail,
              subject: 'Demande d\'hébergement finalisée',
              html: emailBody,
            });
          } else {
            console.log(`No email found for user in demande ${demande._id}`);
          }

          if (userRenouvEmail) {
            console.log("Sending email to renewal user: ", userRenouvEmail);
            await transporter.sendMail({
              from: 'ons.benamorr@gmail.com',
              to: userRenouvEmail,
              subject: 'Renouvellement de demande d\'hébergement finalisée',
              html: emailBody,
            });
          } else {
            console.log(`No renewal email found for demande ${demande._id}`);
          }

          demande.statutDemande = 'Finalisée';
          await demande.save();
        })
      );
      console.log("Finalisation des demandes terminée.");
    } else {
      console.log("Aucune demande à finaliser.");
    }
  } catch (error) {
    console.error("Erreur lors de la vérification et de la finalisation des demandes:", error);
  }
};


export const deleteDemande = async (req, res) => {
  try {
    const deletedDemande = await Demande.findByIdAndDelete(req.params.id);
    if (!deletedDemande) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }
    res.status(200).json({ message: "Demande supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de la demande", error });
  }
};
export const getAllDemandesHebergement = async (req, res) => {
  try {
    const demandes = await Demande.find({ typeDemande: 'Hébergement' }).populate({
      path: 'foyer',
      select: 'typeFoyer'  // Assurez-vous que ce champ existe dans le modèle Foyer
    });

    res.status(200).json(demandes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des demandes d'hébergement", error });
  }
};
export const getAllDemandesByType = async (req, res) => {
  try {
    const { typeDemande } = req.query; 
    console.log(typeDemande, "gg", req.query); // Obtenir le type de demande de la requête, ex. ?typeDemande=Hébergement
    const demandes = await Demande.find({ typeDemande }).populate('foyer');

    if (demandes.length === 0) {
      return res.status(404).json({ message: "Aucune demande trouvée pour le type spécifié" });
    }

    // Include document URLs in the response
    const response = demandes.map(demande => ({
      ...demande.toObject(),
      cinUrl: demande.cin,
      photoUrl: demande.photo,
      attestationUrl: demande.attestationInscription,
      certificatUrl: demande.certificatMedical
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des demandes par type", error });
  }
};
export const updateStatutDemande = async (req, res) => {
    try {
      const { id } = req.params; // ID of the demand to update
      const { statutDemande } = req.body; // New status to set
  
      // Update the demand and return the updated document
      const updatedDemande = await Demande.findByIdAndUpdate(
        id,
        { statutDemande },
        { new: true } // This option makes sure that the updated document is returned
      );
  
      if (!updatedDemande) {
        return res.status(404).json({ message: "Demande non trouvée" });
      }
  
      res.status(200).json(updatedDemande);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la mise à jour du statut de la demande", error });
    }
  };

export const updateDemande = async (req, res) => {
  try {
    const demande = await Demande.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!demande) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }
    res.status(200).json(demande);
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la mise à jour de la demande", error });
  }
};
//renouvellement
export const createRenouvellementDemande = async (req, res) => {
  try {
    const { utilisateur, foyer } = req.body;

    const existingDemande = await Demande.findOne({ utilisateur, statutDemande: 'Approuvée' });

    if (!existingDemande) {
      return res.status(404).json({ message: "Vous n'avez pas de demande précédente pour le renouvellement." });
    }

    const nouvelleDemande = new Demande({
      utilisateur,
      foyer,
      typeDemande: 'Renouvellement',
      statutDemande: 'En attente',
      dateDemande: new Date(),
      demandeOriginale: existingDemande._id
    });

    await nouvelleDemande.save();
    res.status(201).json(nouvelleDemande);
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la création de la demande de renouvellement", error });
  }
};
  
