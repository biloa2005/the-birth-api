import 'dotenv/config'; // Charge votre variable DATABASE_URL du fichier .env
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

// On extrait les composants de votre URL de connexion pour configurer l'adaptateur
// Format attendu dans le .env : mysql://USER:PASSWORD@HOST:PORT/DATABASE
const dbUrl = new URL(process.env.DATABASE_URL);

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace('/', ''),
});

// Instanciation de Prisma avec son adaptateur requis par la v7
const prisma = new PrismaClient({ adapter });

export default prisma;
