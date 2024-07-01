import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import Demande from '../models/Demande.js';

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dpk9mpjsd',
  api_key: '348193888992711',
  api_secret: 'qefN7t3DU47Kdpnhi9i8G56XHM0',
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'documents',
    format: async (req, file) => file.mimetype.split('/')[1], // Dynamically set format based on file type
    public_id: (req, file) => `${file.fieldname}-${Date.now()}`,
  },
});

export const upload = multer({ storage: storage });
// upload Documents
export const uploadDocuments = async (req, res) => {
  try {
    const { demandeId } = req.params;
    const updates = {};

    if (req.files['cin'] && req.files['cin'][0]) {
      updates.cin = req.files['cin'][0].path;
    }
    if (req.files['photo'] && req.files['photo'][0]) {
      updates.photo = req.files['photo'][0].path;
    }
    if (
      req.files['attestationInscription'] &&
      req.files['attestationInscription'][0]
    ) {
      updates.attestationInscription =
        req.files['attestationInscription'][0].path;
    }
    if (req.files['certificatMedical'] && req.files['certificatMedical'][0]) {
      updates.certificatMedical = req.files['certificatMedical'][0].path;
    }

    const updatedDemande = await Demande.findByIdAndUpdate(demandeId, updates, {
      new: true,
    });

    res.status(200).send('Fichiers uploadés avec succès');
  } catch (error) {
    console.error("Error during file upload:", error);
    res.status(500).send('Erreur lors de l\'upload des fichiers');
  }
};
