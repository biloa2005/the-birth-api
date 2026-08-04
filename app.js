const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration des middlewares globaux
app.use(helmet()); // Sécurise les en-têtes HTTP
app.use(cors()); // Autorise les requêtes cross-origin
app.use(morgan('dev')); // Journalise les requêtes dans la console
app.use(express.json()); // Permet de lire le JSON dans req.body
app.use(express.urlencoded({ extended: true })); // Permet de lire les données de formulaires

// Route de test
app.get('/', (req, res) => {
    res.json({ message: "Bienvenue sur votre API Express !" });
});

// Gestion des routes non trouvées (404)
app.use((req, res, next) => {
    res.status(404).json({ error: "Route non trouvée" });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Une erreur interne est survenue" });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur : http://localhost:${PORT}`);
});
