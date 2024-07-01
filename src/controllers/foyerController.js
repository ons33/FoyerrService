import Foyer from '../models/Foyer.js';
import Chambre from '../models/Chambre.js';

// get Chambres By FoyerId
export const getChambresByFoyerId = async (req, res) => {
  try {
    const { foyerId } = req.params;

    // Fetch existing rooms in the specified foyer
    const chambresDansFoyer = await Chambre.find({ foyer: foyerId });

    // Respond with the fetched rooms
    res.status(200).json(chambresDansFoyer);
  } catch (error) {
    // Handle errors
    console.error("Error fetching rooms by foyer ID:", error);
    res
      .status(500)
      .json({ message: "Error fetching rooms by foyer ID.", error });
  }
};
// create Foyer
export const createFoyer = async (req, res) => {
  try {
    const nouveauFoyer = new Foyer(req.body);
    await nouveauFoyer.save();
    res.status(201).json(nouveauFoyer);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la création du foyer", error });
  }
};
// get All Foyers
export const getAllFoyers = async (req, res) => {
  try {
    const foyers = await Foyer.find();
    res.status(200).json(foyers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des foyers", error });
  }
};
// get Foyer ById
export const getFoyerById = async (req, res) => {
  try {
    const foyer = await Foyer.findById(req.params.id);
    if (!foyer) {
      return res.status(404).json({ message: "Foyer non trouvé" });
    }
    res.status(200).json(foyer);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du foyer", error });
  }
};
// update Foyer
export const updateFoyer = async (req, res) => {
  try {
    const foyer = await Foyer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!foyer) {
      return res.status(404).json({ message: "Foyer non trouvé" });
    }
    res.status(200).json(foyer);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la mise à jour du foyer", error });
  }
};
// delete Foyer
export const deleteFoyer = async (req, res) => {
  try {
    const deletedFoyer = await Foyer.findByIdAndDelete(req.params.id);
    if (!deletedFoyer) {
      return res.status(404).json({ message: "Foyer non trouvé" });
    }
    res.status(200).json({ message: "Foyer supprimé" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du foyer", error });
  }
};
// get Chambres By IdFoyer
export const getChambresByIdFoyer = async (req, res) => {};
