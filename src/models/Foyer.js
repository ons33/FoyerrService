import mongoose from 'mongoose';
const { Schema } = mongoose;

const foyerSchema = new Schema({
  typeFoyer: { type: String, enum: ['Interne', 'Externe'], required: true },
  description: { type: String, required: true },
  montant: { type: Number, required: true },
  dureeMois: { type: Number, required: true },
  premiereTranche: { type: Number, required: true },
  capacite: { type: Number },

});

export default mongoose.model('Foyer', foyerSchema);
