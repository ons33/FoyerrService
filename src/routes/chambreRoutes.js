import express from 'express';
import {
  createChambre, getAllChambres, getChambreById, updateChambre, deleteChambre,
  getChambresDisponibles, getUtilisateursByChambre,getChambresDispo,getChambresNonDispo
} from '../controllers/chambreController.js';
import { assignerChambres } from '../controllers/AttributionCambre.js';

const router = express.Router();

router.post('/', createChambre);
router.get('/ch', getAllChambres);
router.get('/getbyid/:id', getChambreById);
router.put('/:id', updateChambre);
router.delete('/:id', deleteChambre);
router.get('/dispo', getChambresDispo);
router.get('/disponible', getChambresDisponibles); // Route pour les chambres disponibles
router.get('/nondispo/ch', getChambresNonDispo); // Route pour les chambres non disponibles

router.post('/attribuer', assignerChambres);

router.get('/:chambreId/utilisateurs', getUtilisateursByChambre);

export default router;
