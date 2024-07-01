import Chambre from '../models/Chambre.js';
import AttributionChambre from '../models/AttributionChambre.js';
import mongoose from 'mongoose';
import Foyer from '../models/Foyer.js';
import Demande from '../models/Demande.js';
import axios from 'axios';


 // get Utilisateurs By Chambre
export const getUtilisateursByChambre = async (req, res) => {
  try {
    const { chambreId } = req.params;
    const accessToken = req.headers.authorization
      ? req.headers.authorization.split(' ')[1]
      : null;

    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Accès non autorisé. Token manquant." });
    }

    const attributions = await AttributionChambre.find({
      chambre: chambreId,
    }).populate({
      path: 'demande',
      model: 'Demande',
      select: 'utilisateur email',
    });

    // Extract emails from attributions
    const emails = attributions.map((attr) => attr.demande.email);

    res.status(200).json(emails);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des identifiants utilisateur de la chambre:",
      error
    );
    res
      .status(500)
      .send(
        "Erreur lors de la récupération des identifiants utilisateur pour la chambre spécifiée."
      );
  }
};
 // create Chambre
export const createChambre = async (req, res) => {
  try {
    const { typeChambre, num, description, foyer, etage } = req.body;

    // Vérifier si le foyer existe
    const existingFoyer = await Foyer.findById(foyer);
    if (!existingFoyer) {
      return res
        .status(400)
        .json({ message: "Le foyer spécifié n'existe pas." });
    }

    // Vérifier si le foyer a assez de place pour ajouter une chambre
    const chambresDansFoyer = await Chambre.find({ foyer });
    if (chambresDansFoyer.length >= existingFoyer.capacite) {
      return res.status(400).json({
        message: "Pas de place dans le foyer pour ajouter une chambre.",
      });
    }

    // Vérifier si le numéro de chambre est unique
    const existingChambre = await Chambre.findOne({ num, foyer });

    if (existingChambre) {
      return res.status(400).json({
        message: "Le numéro de chambre spécifié existe déjà dans ce foyer.",
      });
    }
    let placesDispo;
    switch (typeChambre) {
      case 'Chambre double':
        placesDispo = 2;
        break;
      case 'Appartement pour 4 personnes S+1':
        placesDispo = 4;
        break;
      case 'Appartement pour 6 personnes S+2':
        placesDispo = 6;
        break;
      default:
        placesDispo = 0;
    }

    // Créer la nouvelle chambre
    const nouvelleChambre = new Chambre({
      typeChambre,
      num,
      description,
      foyer,
      placesDispo,
      etage,
      statut: 'Disponible',
    });

    // Enregistrer la chambre dans la base de données
    await nouvelleChambre.save();

    // Répondre avec la chambre créée
    res.status(201).json(nouvelleChambre);
  } catch (error) {
    // Gérer les erreurs
    console.error("Erreur lors de la création de la chambre :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de la chambre.", error });
  }
};
 // get All Chambres
export const getAllChambres = async (req, res) => {
  try {
    const chambres = await Chambre.find().populate('foyer');
    res.status(200).json(chambres);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des chambres", error });
  }
};
 // get Chambre By Id
export const getChambreById = async (req, res) => {
  try {
    const chambre = await Chambre.findById(req.params.id).populate('foyer');
    if (!chambre) {
      return res.status(404).json({ message: "Chambre non trouvée" });
    }
    res.status(200).json(chambre);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de la chambre", error });
  }
};
 // update Chambre
export const updateChambre = async (req, res) => {
  try {
    const chambre = await Chambre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!chambre) {
      return res.status(404).json({ message: "Chambre non trouvée" });
    }
    res.status(200).json(chambre);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la mise à jour de la chambre", error });
  }
};
 // delete Chambre
export const deleteChambre = async (req, res) => {
  try {
    const deletedChambre = await Chambre.findByIdAndDelete(req.params.id);
    if (!deletedChambre) {
      return res.status(404).json({ message: "Chambre non trouvée" });
    }
    res.status(200).json({ message: "Chambre supprimée" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la chambre", error });
  }
};
import { ObjectId } from 'mongoose';
 // get Chambres Disponibles
export const getChambresDisponibles = async (req, res) => {
  try {
    // Récupérer toutes les attributions pour connaître les chambres occupées
    const attributions = await AttributionChambre.find().select(
      'chambre placesDispo'
    );

    // Convertir en un dictionnaire pour un accès rapide
    const attributionsMap = {};
    attributions.forEach((attrib) => {
      attributionsMap[attrib.chambre.toString()] = attrib;
    });

    // Récupérer toutes les chambres
    const chambres = await Chambre.find();

    // Déterminer le statut de chaque chambre
    const chambresWithStatus = chambres.map((chambre) => {
      const chambreAttrib = attributionsMap[chambre._id.toString()];
      if (chambreAttrib) {
        if (chambre.placesDispo > 0) {
          return { ...chambre.toObject(), status: 'half' }; // Partiellement disponible
        } else {
          return { ...chambre.toObject(), status: 'notAvailable' }; // Complètement occupée
        }
      }
      return { ...chambre.toObject(), status: 'available' }; // Entièrement disponible
    });

    res.json(chambresWithStatus);
  } catch (error) {
    console.error("Erreur lors de la récupération des chambres:", error);
    res.status(500).send("Erreur lors de la récupération des chambres.");
  }
};
