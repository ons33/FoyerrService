export const createDemandeHebergement = async (req, res) => {
    try {
      const { utilisateur, foyer } = req.body;
  
      console.log("Utilisateur:", utilisateur); // Affiche l'utilisateur dans la console
      console.log("Foyer:", foyer); // Affiche le foyer choisi
  
      // Vérifiez si l'utilisateur a déjà fait une demande pour l'année universitaire en cours
      const currentYear = moment().year();
      const existingDemande = await DemandeHebergement.findOne({
        utilisateur,
        dateDemande: {
          $gte: new Date(`${currentYear}-01-01`), // Demandes de cette année
          $lt: new Date(`${currentYear + 1}-01-01`) // Jusqu'à la fin de l'année
        }
      });
  
      if (existingDemande) {
        console.log("Demande déjà existante pour cette année"); // Confirme si une demande existe
        return res.status(400).json({ message: "Vous avez déjà déposé votre demande cette année universitaire." });
      }
  
      const nouvelleDemande = new DemandeHebergement({
        utilisateur,
        foyer, // Ajoutez l'ID du foyer choisi
        statutDemande: 'En attente',
        dateDemande: new Date(),
        ...req.body
      });
  
      await nouvelleDemande.save();
      console.log("Demande créée avec succès:", nouvelleDemande); // Confirme la création de la demande
      res.status(201).json(nouvelleDemande);
    } catch (error) {
      console.error("Erreur lors de la création de la demande d'hébergement:", error); // Affiche les erreurs
      res.status(400).json({ message: "Erreur lors de la création de la demande d'hébergement", error });
    }
  };