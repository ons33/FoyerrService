import Demande from '../models/Demande.js';  // Remplacer DemandeHebergement par Demande
import moment from 'moment'; // Pour la gestion des dates

export const createDemande = async (req, res) => {
  try {
    const { utilisateur, foyer, typeDemande } = req.body;
    const currentYear = moment().year();

    // Vérifier si l'utilisateur a déjà une demande pour l'année universitaire en cours
    const existingDemande = await Demande.findOne({
      utilisateur,
      typeDemande,
      dateDemande: { $gte: new Date(`${currentYear}-01-01`), $lt: new Date(`${currentYear + 1}-01-01`) }
    });

    if (existingDemande) {
      return res.status(400).json({ message: "Vous avez déjà une demande pour cette année universitaire." });
    }

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


// export const getAllDemandesHebergement = async (req, res) => {
//   try {
//     const demandes = await DemandeHebergement.find().populate({
//       path: 'foyer', // Inclut les détails du foyer
//       select: 'typeFoyer', // Récupère uniquement le type de foyer
//     });

//     res.status(200).json(demandes); // Retourne les demandes avec le type de foyer
//   } catch (error) {
//     res.status(500).json({ message: "Erreur lors de la récupération des demandes d'hébergement", error });
//   }
// };
// export const getAllDemandesHebergementByType = async (req, res) => {
//   try {
//     const demandes = await DemandeHebergement.find().populate('foyer');
//     res.status(200).json(demandes);
//   } catch (error) {
//     res.status(500).json({ message: "Erreur lors de la récupération des demandes d'hébergement", error });
//   }
// };

// export const getDemandeHebergementById = async (req, res) => {
//   try {
//     const demande = await DemandeHebergement.findById(req.params.id).populate('utilisateur');
//     if (!demande) {
//       return res.status(404).json({ message: "Demande d'hébergement non trouvée" });
//     }
//     res.status(200).json(demande);
//   } catch (error) {
//     res.status(500).json({ message: "Erreur lors de la récupération de la demande d'hébergement",
//   })}
// };
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
    const { typeDemande } = req.query;  // Obtenir le type de demande de la requête, ex. ?typeDemande=Hébergement
    const demandes = await Demande.find({ typeDemande }).populate('foyer');

    if (demandes.length === 0) {
      return res.status(404).json({ message: "Aucune demande trouvée pour le type spécifié" });
    }

    res.status(200).json(demandes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des demandes par type", error });
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

  
