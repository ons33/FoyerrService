import DemandeRenouvellement from '../models/DemandeRenouvellement.js';
import moment from 'moment'; // Assurez-vous que moment est bien installé
import DemandeHebergement from '../models/DemandeHebergement.js';

export const createDemandeRenouvellement = async (req, res) => {
  try {
    const { utilisateur, foyer } = req.body;

    // Ajout de journalisation pour vérifier les entrées
    console.log("Utilisateur:", utilisateur, "Foyer:", foyer);

    const currentYear = moment().year();
    const existingHebergement = await DemandeHebergement.findOne({
      utilisateur,
      dateDemande: {
        $gte: new Date(`${currentYear}-01-01`),
        $lt: new Date(`${currentYear + 1}-01-01`),
      },
    });

    // Si aucune demande originale n'est trouvée
    if (!existingHebergement) {
      return res.status(400).json({ message: "Vous n'êtes pas encore inscrit pour renouveler." });
    }

    // Ajout de journalisation pour vérifier la demande originale
    console.log("Demande originale trouvée:", existingHebergement);

    const nouvelleDemande = new DemandeRenouvellement({
      demandeOriginale: existingHebergement._id,
      utilisateur,
      foyer,
      statutDemande: 'En attente',
      dateDemande: new Date(),
    });

    await nouvelleDemande.save(); // Ligne où l'erreur peut se produire
    res.status(201).json(nouvelleDemande); // Si tout va bien, envoyer le succès
  } catch (error) {
    console.error("Erreur lors de la création de la demande de renouvellement:", error);
    res.status(500).json({ message: "Erreur lors de la création de la demande de renouvellement", error: error.message });
  }
};

export const getAllDemandesRenouvellement = async (req, res) => {
  try {
    const demandes = await DemandeRenouvellement.find().populate('demandeOriginale');
    res.status(200).json(demandes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des demandes de renouvellement", error });
  }
};

export const getDemandeRenouvellementById = async (req, res) => {
  try {
    const demande = await DemandeRenouvellement.findById(req.params.id).populate('demandeOriginale');
    if (!demande) {
      return res.status(404).json({ message: "Demande de renouvellement non trouvée" });
    }
    res.status(200).json(demande);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de la demande de renouvellement", error });
  }
};

export const updateDemandeRenouvellement = async (req, res) => {
  try {
    const demande = await DemandeRenouvellement.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('demandeOriginale');
    if (!demande) {
      return res.status(404).json({ message: "Demande de renouvellement non trouvée" });
    }
    res.status(200).json(demande);
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la mise à jour de la demande de renouvellement", error });
  }
};

export const deleteDemandeRenouvellement = async (req, res) => {
  try {
    const deletedDemande = await DemandeRenouvellement.findByIdAndDelete(req.params.id);
    if (!deletedDemande) {
      return res.status(404).json({ message: "Demande de renouvellement non trouvée" });
    }
    res.status(200).json({ message: "Demande de renouvellement supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de la demande de renouvellement", error });
  }
};
