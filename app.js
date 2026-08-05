import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import prisma from "./src/config/prisma.js"; 
import updateRoutes from "./src/routes/updateBirth.routes.js"
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
//  CONFIGURATION DES MIDDLEWARES GLOBAUX (Toujours en premier !)
// ==========================================
app.use(helmet()); 
app.use(cors()); 
app.use(morgan('dev')); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// ==========================================
//  DÉFINITION DES ROUTES
// ==========================================

app.use('/api/',updateRoutes)



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
