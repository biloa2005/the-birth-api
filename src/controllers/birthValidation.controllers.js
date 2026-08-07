import prisma from "../config/prisma.js";

export const validateBirth = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la naissance existe
    const birth = await prisma.birth.findUnique({
      where: { id },
    });

    if (!birth) {
      return res.status(404).json({
        success: false,
        message: "Naissance introuvable",
      });
    }

    // Vérifier si elle est déjà validé
    if (birth.status === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Cette naissance est déjà validée",
      });
    }

    // Mettre à jour le statutt
    const validatedBirth = await prisma.birth.update({
      where: { id },
      data: {
        status: "APPROVED",
      },
    });

    // Enregistrer dans l'historique
    await prisma.birthHistory.create({
      data: {
        birthId: id,
        action: "VALIDATE",
        userId: req.user?.id || "SYSTEM",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Acte validé avec succès",
      data: validatedBirth,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};