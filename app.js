import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import prisma from "./src/config/prisma.js"; 
import updateRoutes from "./src/routes/updateBirth.routes.js"
import birthRoutes from "./src/routes/birth.routes.js"
import attachmentRoutes from "./src/routes/birthAttachment.routes.js"
import searchRoutes from "./src/routes/searchBirth.routes.js"
import validationRoutes from "./src/routes/birthValidation.routes.js"
import multer from 'multer';

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
// ==========================================gs

app.use('/api/',updateRoutes)// lion
app.use('/api/', searchRoutes)// lion
app.use('/api/',birthRoutes)
app.use('/api/',attachmentRoutes )

app.use('/api/',validationRoutes)

// Gestion des routes non trouvées (404)
app.use((req, res, next) => {
    res.status(404).json({ error: "Route non trouvée" });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);

  // Si l'erreur provient de Multer ou de votre fileFilter
  if (err instanceof multer.MulterError || err.message.includes("Format de fichier")) {
    return res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }

    res.status(500).json({ error: "Une erreur interne est survenue" });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur : http://localhost:${PORT}`);
});
