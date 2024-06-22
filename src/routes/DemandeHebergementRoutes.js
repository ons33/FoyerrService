// import express from 'express';
// import {
//   createDemandeHebergement, getAllDemandesHebergement, getDemandeHebergementById,
//   updateDemandeHebergement, deleteDemandeHebergement,updateStatutDemande,getAllDemandesHebergementByType
// } from '../controllers/demandeHebergementController.js';
// import upload from './../config/upload.js'; // Importez la configuration de Multer

// const router = express.Router();

// router.post('/', createDemandeHebergement); // Route de création de demande
// router.get('/', getAllDemandesHebergement);
// router.get('/type', getAllDemandesHebergementByType);

// router.get('/:id', getDemandeHebergementById);
// router.put('/:id', updateDemandeHebergement);
// router.delete('/:id', deleteDemandeHebergement);
// // Route pour mettre à jour le statut
// router.put('/demande/:id', updateStatutDemande);


// router.post('/upload/:demandeId', upload.fields([
//   { name: 'cin', maxCount: 1 },
//   { name: 'photo', maxCount: 1 },
//   { name: 'attestationInscription', maxCount: 1 },
//   { name: 'certificatMedical', maxCount: 1 }
// ]), async (req, res) => {
//   try {
//     const { demandeId } = req.params;
//     const updates = {};
//     if (req.files['cin']) updates.cin = req.files['cin'][0].path;
//     if (req.files['photo']) updates.photo = req.files['photo'][0].path;
//     if (req.files['attestationInscription']) updates.attestationInscription = req.files['attestationInscription'][0].path;
//     if (req.files['certificatMedical']) updates.certificatMedical = req.files['certificatMedical'][0].path;

//     await DemandeHebergement.findByIdAndUpdate(demandeId, updates);
//     res.send('Fichiers uploadés avec succès');
//   } catch (error) {
//     res.status(500).send('Erreur lors de l\'upload des fichiers');
//   }
// });
// export default router;
