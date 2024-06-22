import mongoose from 'mongoose';
const { Schema } = mongoose;

const attributionChambreSchema = new Schema({
  demande: { type: Schema.Types.ObjectId, ref: 'DemandeHebergement', required: true },
  chambre: { type: Schema.Types.ObjectId, ref: 'Chambre', required: true },
  dateAttribution: { type: Date, default: Date.now },
});

export default mongoose.model('AttributionChambre', attributionChambreSchema);
