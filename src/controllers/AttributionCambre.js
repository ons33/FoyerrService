import AttributionChambre from '../models/AttributionChambre.js';
import Chambre from '../models/Chambre.js';
import Demande from '../models//Demande.js';
import mongoose from 'mongoose';
const { Schema } = mongoose;
const ObjectId = mongoose.Types.ObjectId;
import axios from 'axios';
import nodemailer from 'nodemailer';

//assigner Chambres to students
export const assignerChambres = async (req, res) => {
  try {
    // Extract the access token from the request headers
    const accessToken = req.headers.authorization.split(' ')[1];
    // Récupérer les demandes en attente
    const demandesEnAttente = await Demande.find({
      statutDemande: 'En attente',
    });

    for (const demande of demandesEnAttente) {
      const chambresDisponibles = await getChambresDisponibles(demande.foyer);

      // Logique d'attribution de chambres
      if (chambresDisponibles.length > 0) {
        const chambreAttribuee = chambresDisponibles[0]; // Choisissez une chambre disponible
        await new AttributionChambre({
          chambre: chambreAttribuee._id,
          demande: demande._id,
        }).save();

        // Mettre à jour le statut de la demande
        await Demande.findByIdAndUpdate(demande._id, {
          statutDemande: 'Approuvée',
        });
        // Mettre à jour la chambre attribuée
        await Chambre.findByIdAndUpdate(chambreAttribuee._id, {
          $inc: { placesDispo: -1 }, // Décrémenter le nombre de places disponibles
          $set: {
            statut:
              chambreAttribuee.placesDispo === 1
                ? 'Non disponible'
                : 'Disponible',
          }, // Mettre à jour le statut
        });

        await sendEmailToStudent(demande._id, accessToken); // Passer l'identifiant de la demande et l'access token à la fonction d'envoi d'e-mails
      } else {
        console.log("Aucune chambre disponible pour cette demande:", demande);
      }
    }

    res.status(200).json({ message: 'Attribution des chambres terminée' });
  } catch (error) {
    console.error("Erreur lors de l'attribution des chambres :", error);
    res
      .status(500)
      .json({ message: 'Erreur lors de l\'attribution des chambres' });
  }
};

// Fonction pour envoyer un e-mail à l'étudiant après l'affectation de la chambre
export const sendEmailToStudent = async (demandeId, accessToken) => {
  try {
    // Récupérer les détails de la demande d'hébergement
    const demande = await Demande.findById(demandeId);
    if (!demande) {
      console.log("Demande d'hébergement introuvable");
      return;
    }
    // Récupérer les détails de la chambre attribuée à la demande
    const attributionChambre = await AttributionChambre.findOne({
      demande: demandeId,
    }).populate('chambre');
    if (!attributionChambre) {
      console.log("Aucune chambre attribuée à cette demande");
      return;
    }
    // Créer le corps de l'e-mail
    const emailBody = `
  <html>
  <body>
    <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="text-align: center; background-color: #405f6b; padding: 20px; border-bottom: 1px solid #ddd;">
        <a href="https://res.cloudinary.com/dpk9mpjsd/image/upload/v1715799077/documents/photo-1715799065900.png" alt="Logo"/>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #333;">Bonjour ,</h2>
          <p style="color: #555;">Votre demande d'hébergement a été approuvée merci de suivre la procédure de confirmation :</p>
          <p style="color: #555;">Dossier numérique en ligne via le lien suivant <a href="http://localhost:3001/mesdocuments" style="color: #405f6b;"> Mes Documents</a></p>
          <ul style="color: #555; padding-left: 20px;">
            <li>Photo</li>
            <li>Attestation de réussite / inscription</li>
            <li>Copie CIN ou Passeport</li>
            <li>Certificat médical attestant de la capacité de vivre au foyer</li>
            <li>Contrat signé</li>
            <li>Règlement intérieur signé</li>
            <li>Reçu du paiment (Caution 270dt résidence 260 dt foyer et le Paiement loyer intégral 2700 dt résidence 2600 dt foyer)</li>

          </ul>
          <h3 style="color: #333;">Pour le renouvellement</h3>
          <p style="color: #555;">Paiement de 900 dt lors de l'acceptation de dossier</p>
          <p style="color: #555;">800 dt en septembre + caution de 250 dt</p>
          <p style="color: #555;">800 dt en janvier</p>
          <h3 style="color: #333;">II. Pour les étudiants internationaux</h3>
          <p style="color: #555;">Règlement intégral chambre double 900 euros</p>
          <p style="color: #555;">Caution 100 euros</p>
          <h3 style="color: #333;">III. votre dossier ne sera pris en considération que :</h3>
          <p style="color: #555;">si aucun document ne manque</p>
          <p style="color: #555;">le règlement intégral de frais d'hébergement doit être effectué au plus tard dans les 72h qui suivent ce mail faute de quoi, la réservation est annulée.</p>
        </div>
        <div style="background-color: #405f6b; color: #ffffff; text-align: center; padding: 10px;">
          <p style="margin: 0;">Merci pour votre confiance,</p>
          <p style="margin: 0;">L'équipe Espritook</p>
        </div>
      </div>
    </div>
  </body>
  </html>
`;
    // Configurer le transporteur SMTP pour l'envoi d'e-mails (utilisez vos propres informations SMTP)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'ons.benamorr@gmail.com',
        pass: 'balj ctus kuar ivbm',
      },
    });
    // Envoyer l'e-mail
    await transporter.sendMail({
      from: 'ons.benamorr@gmail.com',
      to: demande.email,
      subject: 'Votre demande d\'hébergement a été approuvée',
      html: emailBody,
    });

    console.log("E-mail envoyé à l'utilisateur avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'e-mail à l'utilisateur :",
      error
    );
  }
};

// Fonction utilitaire pour obtenir les chambres disponibles
const getChambresDisponibles = async (foyerId) => {
  return await Chambre.find({ foyer: foyerId, statut: 'Disponible' });
};
