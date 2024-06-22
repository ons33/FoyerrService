import express from 'express';
import { createFoyer, getAllFoyers, getFoyerById, updateFoyer, deleteFoyer ,getChambresByFoyerId} from '../controllers/foyerController.js';

const router = express.Router();

router.post('/', createFoyer);
router.get('/', getAllFoyers);
router.get('/:id', getFoyerById);
router.put('/:id', updateFoyer);
router.delete('/:id', deleteFoyer);
router.get('/foyer/:foyerId', getChambresByFoyerId);

export default router;
