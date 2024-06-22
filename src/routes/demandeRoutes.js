import express from 'express';
import {
  createDemande, // Renommé pour refléter l'unification
  getAllDemandes, // Cette fonction peut filtrer par type si nécessaire
  getDemandeById,
  updateDemande, // Gère la mise à jour de toute demande, indépendamment du type
  deleteDemande, // Gère la suppression de toute demande
  updateStatutDemande, // Route pour mettre à jour le statut
  getAllDemandesByType ,
  checkExistingDemand,// Gère la récupération des demandes par type
  getDemandIdByUserId,
  checkAndNotifyIncompleteDemandes ,finalizeDemande,  createRenouvellementDemande,


} from '../controllers/demandeController.js'; // Renommé pour refléter l'unification
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from 'cloudinary';
import { uploadDocuments, upload } from '../controllers/DocumentController.js';

const router = express.Router();

// Routes pour la gestion des demandes
router.post('/', createDemande);
router.get('/', getAllDemandes);
router.get('/byType', getAllDemandesByType); // Peut-être avec un query pour spécifier le type, ex: /?type=Hébergement
router.get('/:id', getDemandeById);
router.put('/:id', updateDemande);
router.delete('/:id', deleteDemande);
router.put('/status/:id', updateStatutDemande); // Route modifiée pour clarifier l'action
router.get('/exist/:utilisateur', checkExistingDemand);
router.get('/get-demand-by-user/:utilisateur', getDemandIdByUserId);
router.post('/upload/:demandeId', upload.fields([
  { name: 'cin', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'attestationInscription', maxCount: 1 },
  { name: 'certificatMedical', maxCount: 1 }
]), uploadDocuments);
// Inside your route handler in the backend
router.post('/reminder', async (req, res) => {
  const accessToken = req.headers.authorization.split(' ')[1];
  try {
    const messages = await checkAndNotifyIncompleteDemandes(accessToken);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'envoi des rappels.' });
  }
});
router.put('/finalize/:id', async (req, res) => {
  const accessToken = req.headers.authorization.split(' ')[1];
  try {
    const messages = await finalizeDemande(accessToken);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la finalisation des demandes.' });
  }
});
export default router;
