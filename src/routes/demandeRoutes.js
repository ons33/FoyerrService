import express from 'express';
import {
  createDemande,
  getAllDemandes,
  getDemandeById,
  updateDemande,
  deleteDemande,
  updateStatutDemande,
  getAllDemandesByType,
  checkExistingDemand,
  getDemandIdByUserId,
  checkAndNotifyIncompleteDemandes,
  finalizeDemande,
  createRenouvellementDemande,
} from '../controllers/demandeController.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from 'cloudinary';
import { uploadDocuments, upload } from '../controllers/DocumentController.js';

const router = express.Router();

router.post('/', createDemande);
router.get('/', getAllDemandes);
router.get('/byType', getAllDemandesByType);
router.get('/:id', getDemandeById);
router.put('/:id', updateDemande);
router.delete('/:id', deleteDemande);
router.put('/status/:id', updateStatutDemande);
router.get('/exist/:utilisateur', checkExistingDemand);
router.get('/get-demand-by-user/:utilisateur', getDemandIdByUserId);
router.post(
  '/upload/:demandeId',
  upload.fields([
    { name: 'cin', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'attestationInscription', maxCount: 1 },
    { name: 'certificatMedical', maxCount: 1 },
  ]),
  uploadDocuments
);

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
    res
      .status(500)
      .json({ error: 'Erreur lors de la finalisation des demandes.' });
  }
});
export default router;
