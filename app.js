import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import prisma from "./src/config/prisma.js"; 
import updateRoutes from "./src/routes/updateBirth.routes.js"
import birthRoutes from "./src/routes/birth.routes.js"
import historyRoutes from "./src/routes/birthHistory.routes.js"
import pdfRoutes from "./src/routes/birthPdf.routes.js"
import attachmentRoutes from "./src/routes/birthAttachment.routes.js"
import searchRoutes from "./src/routes/searchBirth.routes.js"

import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import validationRoutes from "./src/routes/birthValidation.routes.js"
import multer from 'multer';

const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: 'http://localhost:5173', // Remplacez par l'URL de votre application frontend (ex: React, Vue, Angular)
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true // Autorise l'envoi des cookies et en-têtes d'authentification
};

// ==========================================
//  CONFIGURATION DES MIDDLEWARES GLOBAUX (Toujours en premier !)
// ==========================================
app.use(helmet()); 
app.use(cors(corsOptions)); 
app.use(morgan('dev')); 
app.use(express.json()); 

app.use(express.urlencoded({ extended: true })); 

// ==========================================
//  DÉFINITION DES ROUTES
// ==========================================gs

app.use('/api/',updateRoutes)// lion
app.use('/api/', searchRoutes)// lion
app.use('/api/',birthRoutes)
app.use('/api/',pdfRoutes)
app.use('/api/',attachmentRoutes )
app.use('/api/',historyRoutes)
app.use('/api/',validationRoutes)
//swagger
const swaggerDocument = YAML.load("./docs/swagger.yaml");

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

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
