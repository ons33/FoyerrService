import mongoose from 'mongoose';
const { Schema } = mongoose;

const demandeRenouvellementSchema = new Schema({
  demandeOriginale: { type: Schema.Types.ObjectId, ref: 'DemandeHebergement' },
  foyer: { type: Schema.Types.ObjectId, ref: 'Foyer', required: true }, // Ajout du champ foyer
  utilisateur: { type: String,  },
  dateDemande: { type: Date, default: Date.now },
  statutDemande: { type: String, enum: ['En attente', 'Approuvée', 'Rejetée'], default: 'En attente' }
});

export default mongoose.model('DemandeRenouvellement', demandeRenouvellementSchema);
