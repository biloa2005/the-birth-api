import prisma from "../config/prisma.js";

export const uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const birth = await prisma.birth.findUnique({
      where: { id },
    });

    if (!birth) {
      return res.status(404).json({
        success: false,
        message: "Naissance introuvable",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier envoyé",
      });
    }

    const attachment = await prisma.birthAttachment.create({
      data: {
        birthId: id,
        fileName: req.file.originalname,
        filePath: req.file.path,
      },
    });

    await prisma.birthHistory.create({
      data: {
        birthId: id,
        action: "ADD_ATTACHMENT",
        userId: req.user?.id || "SYSTEM",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Pièce jointe ajoutée avec succès",
      data: attachment,
    });
  } catch (error) {
     console.error("ERREUR UPLOAD :", error);

    return res.status(500).json({
        success:false,
        message:error.message,
        stack:error.stack
    });
  }
};