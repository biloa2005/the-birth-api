import prisma from "../config/prisma.js";

// =====================================================
// 1. CRÉATION D'UNE NAISSANCE
// =====================================================
export const createBirth = async (req, res) => {
  try {
    const { 
      childFirstname, 
      childLastname, 
      birthDate, 
      birthPlace, 
      sex, 
      centerId, 
      fatherName, 
      motherName, 
      fatherJob, 
      motherJob, 
      agentName 
    } = req.body;

    // Validation simple des champs obligatoires
    if (
      !childFirstname || 
      !childLastname || 
      !birthDate || 
      !birthPlace || 
      !sex || 
      !fatherName || 
      !motherName || 
      !agentName
    ) {
      return res.status(400).json({ 
        success: false, 
        message: "Les champs obligatoires sont requis" 
      });
    }

    // Génération du numéro d'acte
    const year = new Date().getFullYear();
    const count = await prisma.birth.count({ 
      where: { 
        createdAt: { 
          gte: new Date(`${year}-01-01`), 
          lt: new Date(`${year + 1}-01-01`) 
        } 
      } 
    });
    const actNumber = `YAO05-${year}-${String(count + 1).padStart(6, "0")}`;

    // Création naissance + parents + historique de création en une seule opération
    const birth = await prisma.birth.create({
      data: {
        actNumber,
        childFirstname,
        childLastname,
        birthDate: new Date(birthDate),
        birthPlace,
        sex,
        status: "PENDING",
        centerId,
        createdBy: req.user?.id || "SYSTEM",
        parents: {
          create: { fatherName, motherName, fatherJob, motherJob }
        },
        histories: {
          create: { 
            action: "CREATE", 
            userId: req.user?.id || "SYSTEM",
            agentName // 👈 L'agent est stocké ici dans l'historique (Option B)
          }
        }
      },
      include: { parents: true, histories: true }
    });

    return res.status(201).json({ 
      success: true, 
      message: "naissance enregistree", 
      data: { id: birth.id, actNumber: birth.actNumber } 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur interne du serveur" 
    });
  }
};

// =====================================================
// 2. AFFICHER TOUTES LES NAISSANCES
// =====================================================
export const allBirth = async (req, res) => {
  try {
    const allBirth = await prisma.birth.findMany();
    res.status(200).json({ success: true, allBirth });
  } catch (error) {
    console.error(error?.stack || error);
    res.status(500).json({ 
      success: false, 
      message: "erreur du serveur 🕵️‍♂️" 
    });
  }
};

// =====================================================
// 3. AFFICHER UNE NAISSANCE PAR ID
// =====================================================
export const getBirthById = async (req, res) => {
  try {
    const { id } = req.params;
    const birth = await prisma.birth.findUnique({
      where: { id },
      include: {
        parents: true,
        attachments: true,
        histories: { 
          orderBy: { createdAt: "desc" } 
        }
      }
    });

    if (!birth) {
      return res.status(404).json({ 
        success: false, 
        message: "Naissance introuvable" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Naissance récupérée avec succès",
      data: birth // 👈 L'agent apparaîtra automatiquement dans le tableau des histories
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur interne du serveur" 
    });
  }
};

// =====================================================
// 4. SUPPRIMER UNE NAISSANCE (NON VALIDÉE)
// =====================================================
export const deleteBirth = async (req, res) => {
  try {
    const { id } = req.params;
    const birth = await prisma.birth.findUnique({ where: { id } });

    if (!birth) {
      return res.status(404).json({ 
        success: false, 
        message: "Naissance introuvable" 
      });
    }

    if (birth.status !== "PENDING") {
      return res.status(400).json({ 
        success: false, 
        message: "Seules les naissances non validées peuvent être supprimées" 
      });
    }

    await prisma.birth.delete({ where: { id } });
    return res.status(200).json({ 
      success: true, 
      message: "Naissance non validée supprimée avec succès" 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur interne du serveur" 
    });
  }
};

// =====================================================
// 5. STATISTIQUES DASHBOARD
// =====================================================
export const getBirthDashboard = async (req, res) => {
  try {
    const totalBirths = await prisma.birth.count();
    const approvedBirths = await prisma.birth.count({ where: { status: "APPROVED" } });
    const pendingBirths = await prisma.birth.count({ where: { status: "PENDING" } });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const birthsToday = await prisma.birth.count({
      where: {
        createdAt: { gte: todayStart, lt: tomorrowStart }
      }
    });

    const latestBirths = await prisma.birth.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { parents: true }
    });

    return res.status(200).json({
      success: true,
      message: "Statistiques du dashboard des naissances récupérées avec succès",
      data: { totalBirths, approvedBirths, pendingBirths, birthsToday, latestBirths }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur interne du serveur" 
    });
  }
};

// =====================================================
// 6. RECHERCHE D'UN ACTE DE NAISSANCE
// =====================================================
export const searchBirth = async (req, res) => {
  try {
    const { actNumber, childLastname, childFirstname } = req.query;

    const cleanActNumber = actNumber?.trim();
    const cleanLastname = childLastname?.trim();
    const cleanFirstname = childFirstname?.trim();

    // Aucun critère fourni
    if (!cleanActNumber && !cleanLastname && !cleanFirstname) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir un numéro d'acte, un nom ou un prénom."
      });
    }

    // Recherche par numéro d'acte
    if (cleanActNumber) {
      const birth = await prisma.birth.findUnique({
        where: { actNumber: cleanActNumber },
        include: {
          parents: true,
          attachments: true,
          histories: true // 👈 Inclus l'historique contenant l'agentName
        }
      });

      if (!birth) {
        return res.status(404).json({
          success: false,
          message: "Aucun acte trouvé avec ce numéro d'acte.",
          count: 0,
          data: null
        });
      }

      return res.status(200).json({
        success: true,
        message: "Acte trouvé.",
        searchType: "actNumber",
        count: 1,
        data: birth
      });
    }

    // Recherche par Nom / Prénom
    const where = {};
    if (cleanLastname) {
      where.childLastname = { contains: cleanLastname };
    }
    if (cleanFirstname) {
      where.childFirstname = { contains: cleanFirstname };
    }

    const births = await prisma.birth.findMany({
      where,
      include: {
        parents: true,
        attachments: true,
        histories: true // 👈 Inclus également ici
      },
      orderBy: { createdAt: "desc" }
    });

    if (births.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucun acte trouvé avec les informations fournies.",
        searchType: "name",
        count: 0,
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      message: births.length === 1 ? "Un acte trouvé." : `${births.length} actes trouvés.`,
      searchType: "name",
      count: births.length,
      data: births
    });

  } catch (error) {
    console.error("Erreur recherche acte :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur interne du serveur."
    });
  }
};
