import express from 'express';
import {
  createChambre,
  getAllChambres,
  getChambreById,
  updateChambre,
  deleteChambre,
  getChambresDisponibles,
  getUtilisateursByChambre,
} from '../controllers/chambreController.js';
import { assignerChambres } from '../controllers/AttributionCambre.js';

const router = express.Router();

router.post('/', createChambre);
router.get('/ch', getAllChambres);
router.get('/getbyid/:id', getChambreById);
router.put('/:id', updateChambre);
router.delete('/:id', deleteChambre);
router.get('/dispo', getChambresDisponibles);

router.post('/attribuer', assignerChambres);

router.get('/:chambreId/utilisateurs', getUtilisateursByChambre);

export default router;
