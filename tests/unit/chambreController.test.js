// tests/unit/chambreController.test.js
import { createChambre, getAllChambres, getChambreById, updateChambre, deleteChambre } from '../../src/controllers/chambreController';
import Chambre from '../../src/models/Chambre';
import Foyer from '../../src/models/Foyer';
import mongoose from 'mongoose';

jest.mock('../../src/models/Chambre');
jest.mock('../../src/models/Foyer');

describe('Chambre Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });




  it('should update a chambre', async () => {
    const req = { params: { id: new mongoose.Types.ObjectId() }, body: { description: 'Updated room' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const chambre = { typeChambre: 'Chambre double', num: 111, description: 'Updated room', foyer: "66245fff1f08c1eb3a2ad3ff", etage: 1, placesDispo: 2 };

    Chambre.findByIdAndUpdate.mockResolvedValue(chambre);

    await updateChambre(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(chambre);
  });

  it('should delete a chambre', async () => {
    const req = { params: { id: new mongoose.Types.ObjectId() } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    Chambre.findByIdAndDelete.mockResolvedValue(true);

    await deleteChambre(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Chambre supprimée' });
  });
});
