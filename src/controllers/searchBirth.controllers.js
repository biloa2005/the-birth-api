import prisma from "../config/prisma.js";

export const searchBirth = async (req, res) => {
  try {
    const { actNumber } = req.params;

    // Vérificationn
    if (!actNumber) {
      return res.status(400).json({
        success: false,
        message: "Le numéro d'acte est obligatoire.",
      });
    }

    // Recherche
    const birth = await prisma.birth.findUnique({
      where: {
        actNumber,
      },
      include: {
        parents: true,
        attachments: true,
      },
    });

    if (!birth) {
      return res.status(404).json({
        success: false,
        message: "Aucun acte trouvé.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Acte trouvé.",
      data: birth,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Erreur interne du serveur.",
    });
  }
};