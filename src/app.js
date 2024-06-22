
import express from 'express';
import bodyParser from 'body-parser';
import connectDataBase from "./config/MongoDb.js";
import dotenv from 'dotenv';
dotenv.config();
import session from 'express-session';
import { MemoryStore } from 'express-session';
import cors from 'cors';
import axios from "axios";

const app = express();
const port = process.env.PORT || 3003;
connectDataBase();
import foyerRoutes from './routes/foyerRoutes.js';
import chambreRoutes from './routes/chambreRoutes.js';
// import demandeHebergementRoutes from './routes/DemandeHebergementRoutes.js';
// import demandeRenouvellementRoutes from './routes/demandeRenouvellementRoutes.js';
import demandeRoutes from './routes/demandeRoutes.js'
  
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/foyers', foyerRoutes);
app.use('/api/chambres', chambreRoutes);
 app.use('/api/demandes', demandeRoutes);
// app.use('/api/demandesRenouvellement', demandeRenouvellementRoutes);

app.get('/', (req, res) => {
    res.send('Mouna && Ons Project PFE!');
});

app.listen(port, () => {
    console.log(`Serveur écoutant sur le port ${port}`);
});
export default app;