import mongoose from 'mongoose';
const { Schema } = mongoose;

const demandeHebergementSchema = new Schema({
  utilisateur: { type: String,  },
  foyer: { type: Schema.Types.ObjectId, ref: 'Foyer', required: true }, // Ajout du champ foyer
  cin: { type: String },
  photo: { type: String },
  attestationInscription: { type: String },
  certificatMedical: { type: String },
  dateDemande: { type: Date, default: Date.now },
  statutDemande: { type: String, enum: ['En attente', 'Approuvée', 'Rejetée'], default: 'En attente' }
});

export default mongoose.model('DemandeHebergement', demandeHebergementSchema);
