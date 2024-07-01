import mongoose from 'mongoose';
const { Schema } = mongoose;

const chambreSchema = new Schema({
  typeChambre: {
    type: String,
    enum: [
      'Chambre double',
      'Appartement pour 4 personnes S+1',
      'Appartement pour 6 personnes S+2',
    ],
    required: true,
  },
  num: { type: Number, required: true },
  description: { type: String, required: true },
  foyer: { type: Schema.Types.ObjectId, ref: 'Foyer', required: true },
  placesDispo: { type: Number, required: true },
  etage: { type: Number, required: true },
  statut: {
    type: String,
    enum: ['Disponible', 'Non disponible', 'En cours'],
    default: 'Disponible',
  },
});
export default mongoose.model('Chambre', chambreSchema);
