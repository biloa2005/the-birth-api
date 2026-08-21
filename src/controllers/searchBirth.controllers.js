import prisma from "../config/prisma.js";

/**
 * Recherche d'un acte de naissance
 *
 * Recherche possible :
 * 1. ?actNumber=ACT-001
 * 2. ?childLastname=NGONO
 * 3. ?childFirstname=Paul
 * 4. ?childLastname=NGONO&childFirstname=Paul
 *
 * Le type de recherche est déterminé automatiquement.
 */
export const searchBirth = async (req, res) => {
  try {
    const {
      actNumber,
      childLastname,
      childFirstname,
    } = req.query;

    // Nettoyage des valeurs
    const cleanActNumber = actNumber?.trim();
    const cleanLastname = childLastname?.trim();
    const cleanFirstname = childFirstname?.trim();

    // =====================================================
    // 1. AUCUN CRITÈRE
    // =====================================================

    if (!cleanActNumber && !cleanLastname && !cleanFirstname) {
      return res.status(400).json({
        success: false,
        message:
          "Veuillez fournir un numéro d'acte, un nom ou un prénom.",
      });
    }

    // =====================================================
    // 2. RECHERCHE PAR NUMÉRO D'ACTE
    // =====================================================

    if (cleanActNumber) {
      const birth = await prisma.birth.findUnique({
        where: {
          actNumber: cleanActNumber,
        },
        include: {
          parents: true,
          attachments: true,
          histories: true,
        },
      });

      if (!birth) {
        return res.status(404).json({
          success: false,
          message: "Aucun acte trouvé avec ce numéro d'acte.",
          count: 0,
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Acte trouvé.",
        searchType: "actNumber",
        count: 1,
        data: birth,
      });
    }

    // =====================================================
    // 3. RECHERCHE PAR NOM / PRÉNOM
    // =====================================================

    const where = {};

    if (cleanLastname) {
      where.childLastname = {
        contains: cleanLastname,
      };
    }

    if (cleanFirstname) {
      where.childFirstname = {
        contains: cleanFirstname,
      };
    }

    const births = await prisma.birth.findMany({
      where,
      include: {
        parents: true,
        attachments: true,
        histories: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // =====================================================
    // 4. AUCUN RÉSULTAT
    // =====================================================

    if (births.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucun acte trouvé avec les informations fournies.",
        searchType: "name",
        count: 0,
        data: [],
      });
    }

    // =====================================================
    // 5. RÉSULTAT(S)
    // =====================================================

    return res.status(200).json({
      success: true,
      message:
        births.length === 1
          ? "Un acte trouvé."
          : `${births.length} actes trouvés.`,
      searchType: "name",
      count: births.length,
      data: births,
    });
  } catch (error) {
    console.error("Erreur recherche acte :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur interne du serveur.",
    });
  }
};