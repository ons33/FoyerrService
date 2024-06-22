// tests/integration/chambre.test.js
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app';
import Chambre from '../../src/models/Chambre';
import Foyer from '../../src/models/Foyer';

describe('Chambre API', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.disconnect(); // Ensure any existing connections are closed
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }, 30000); // Increase timeout to 30 seconds

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  }, 30000); // Increase timeout to 30 seconds

  beforeEach(async () => {
    await Foyer.deleteMany({});
    await Chambre.deleteMany({});
  });

  it('should create a new chambre', async () => {
    const foyer = await Foyer.create({
      premiereTranche: 1000,
      dureeMois: 12,
      montant: 5000,
      description: 'A nice foyer',
      typeFoyer: 'Interne',
      capacite: 10
    });
    const res = await request(app)
      .post('/api/chambres')
      .send({ typeChambre: 'Chambre double', num: 101, description: 'Nice room', foyer: foyer._id, etage: 1, placesDispo: 2 });

    expect(res.statusCode).toEqual(201);
    expect(res.body.typeChambre).toBe('Chambre double');
  });

  it('should get all chambres', async () => {
    const foyer = await Foyer.create({
      premiereTranche: 1000,
      dureeMois: 12,
      montant: 5000,
      description: 'A nice foyer',
      typeFoyer: 'Interne',
      capacite: 10
    });
    await Chambre.create({ typeChambre: 'Chambre double', num: 101, description: 'Nice room', foyer: foyer._id, etage: 1, placesDispo: 2 });

    const res = await request(app).get('/api/chambres/ch');

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].typeChambre).toBe('Chambre double');
  });

  it('should get chambre by id', async () => {
    const foyer = await Foyer.create({
      premiereTranche: 1000,
      dureeMois: 12,
      montant: 5000,
      description: 'A nice foyer',
      typeFoyer: 'Interne',
      capacite: 10
    });
    const chambre = await Chambre.create({ typeChambre: 'Chambre double', num: 101, description: 'Nice room', foyer: foyer._id, etage: 1, placesDispo: 2 });

    const res = await request(app).get(`/api/chambres/getbyid/${chambre._id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.typeChambre).toBe('Chambre double');
  });

  it('should update a chambre', async () => {
    const foyer = await Foyer.create({
      premiereTranche: 1000,
      dureeMois: 12,
      montant: 5000,
      description: 'A nice foyer',
      typeFoyer: 'Interne',
      capacite: 10
    });
    const chambre = await Chambre.create({ typeChambre: 'Chambre double', num: 101, description: 'Nice room', foyer: foyer._id, etage: 1, placesDispo: 2 });

    const res = await request(app)
      .put(`/api/chambres/${chambre._id}`)
      .send({ description: 'Updated room' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.description).toBe('Updated room');
  });

  it('should delete a chambre', async () => {
    const foyer = await Foyer.create({
      premiereTranche: 1000,
      dureeMois: 12,
      montant: 5000,
      description: 'A nice foyer',
      typeFoyer: 'Interne',
      capacite: 10
    });
    const chambre = await Chambre.create({ typeChambre: 'Chambre double', num: 101, description: 'Nice room', foyer: foyer._id, etage: 1, placesDispo: 2 });

    const res = await request(app).delete(`/api/chambres/${chambre._id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Chambre supprimée');
  });
});
