import mongoose from 'mongoose';
const { Schema } = mongoose;

const demandeSchema = new Schema({
  utilisateur: { type: String, required: true },
  email: { type: String, required: false },
  foyer: { type: Schema.Types.ObjectId, ref: 'Foyer', required: true },
  typeDemande: { type: String, enum: ['Hebergement', 'Renouvellement'], required: true },
  dateDemande: { type: Date, default: Date.now },
  statutDemande: { type: String, enum: ['En attente', 'Approuvée', 'Rejetée', 'expirée','Finalisée'], default: 'En attente' },
  
  // Champs spécifiques au documents
  cin: { type: String },
  photo: { type: String },
  attestationInscription: { type: String },
  certificatMedical: { type: String },

  // Champs spécifiques à la demande de renouvellement
  demandeOriginale: { type: Schema.Types.ObjectId, ref: 'Demande' } // Référence à une demande précédente si c'est un renouvellement
});

export default mongoose.model('Demande', demandeSchema);
