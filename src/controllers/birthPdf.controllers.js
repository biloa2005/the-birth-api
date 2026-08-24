import prisma from "../config/prisma.js";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

// =====================================================
// FORMAT DE PAGE PERSONNALISÉ : 21 cm x 33 cm
// =====================================================

const CM = 28.3465;
const PAGE_WIDTH = 21 * CM;
const PAGE_HEIGHT = 33 * CM;

export const printBirth = async (req, res) => {
  try {
    const { id } = req.params;

    // =====================================================
    // RECHERCHER LA NAISSANCE
    // =====================================================

    const birth = await prisma.birth.findUnique({
      where: {
        id
      },
      include: {
        parents: true
      }
    });

    if (!birth) {
      return res.status(404).json({
        success: false,
        message: "Acte introuvable"
      });
    }

    // =====================================================
    // VÉRIFICATION DU STATUT
    // =====================================================

    if (birth.status !== "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Cet acte n'est pas encore validé"
      });
    }

    // =====================================================
    // URL DU QR CODE
    // =====================================================

    const verificationUrl =
      `http://localhost:3000/verify/${birth.id}`;

    // =====================================================
    // QR CODE
    // =====================================================

    const qrCode = await QRCode.toDataURL(
      verificationUrl,
      {
        errorCorrectionLevel: "H",
        margin: 1,
        width: 250
      }
    );

    // =====================================================
    // DOCUMENT — FORMAT 21 x 33 cm
    // =====================================================

    const doc = new PDFDocument({
      size: [PAGE_WIDTH, PAGE_HEIGHT],
      margin: 0,
      autoFirstPage: true
    });

    // =====================================================
    // HEADERS HTTP
    // =====================================================

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename="acte-${birth.actNumber}.pdf"`
    );

    doc.pipe(res);

    // =====================================================
    // COULEURS
    // =====================================================

    const GREEN = "#00843D";
    const RED = "#CE1126";
    const YELLOW = "#FCD116";

    const DARK = "#1F2937";
    const GREY = "#6B7280";
    const LIGHT = "#F3F4F6";

    // =====================================================
    // BANDE SUPÉRIEURE
    // =====================================================

    doc
      .rect(0, 0, 198.4, 8)
      .fill(GREEN);

    doc
      .rect(198.4, 0, 198.4, 8)
      .fill(RED);

    doc
      .rect(396.8, 0, 198.5, 8)
      .fill(YELLOW);

    // =====================================================
    // EN-TÊTE
    // =====================================================

    doc
      .fillColor(GREEN)
      .font("Helvetica-Bold")
      .fontSize(17)
      .text(
        "RÉPUBLIQUE DU CAMEROUN",
        50,
        28,
        {
          width: 495,
          align: "center"
        }
      );

    doc
      .fillColor(DARK)
      .font("Helvetica")
      .fontSize(9)
      .text(
        "Paix - Travail - Patrie",
        50,
        49,
        {
          width: 495,
          align: "center"
        }
      );

    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        "MINISTÈRE DE LA DÉCENTRALISATION ET DU DÉVELOPPEMENT LOCAL",
        50,
        67,
        {
          width: 495,
          align: "center"
        }
      );

    // =====================================================
    // LIGNE TRICOLORE
    // =====================================================

    doc
      .rect(50, 154, 165, 3)
      .fill(GREEN);

    doc
      .rect(215, 154, 165, 3)
      .fill(RED);

    doc
      .rect(380, 154, 165, 3)
      .fill(YELLOW);

    // =====================================================
    // TITRE
    // =====================================================

    doc
      .roundedRect(
        60,
        171,
        475,
        50,
        6
      )
      .fill(GREEN);

    doc
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .fontSize(20)
      .text(
        "ACTE DE NAISSANCE",
        60,
        187,
        {
          width: 475,
          align: "center"
        }
      );

    // =====================================================
    // NUMÉRO ACTE
    // =====================================================

    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(
        "NUMÉRO DE L'ACTE",
        50,
        238
      );

    doc
      .fillColor(RED)
      .font("Helvetica-Bold")
      .fontSize(15)
      .text(
        birth.actNumber,
        50,
        255
      );

    // =====================================================
    // INFORMATIONS ENFANT
    // =====================================================

    doc
      .fillColor(GREEN)
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(
        "INFORMATIONS DE L'ENFANT",
        50,
        297
      );

    doc
      .rect(50, 318, 495, 2)
      .fill(YELLOW);

    doc
      .roundedRect(
        50,
        335,
        495,
        130,
        6
      )
      .fill(LIGHT);

    doc
      .roundedRect(
        50,
        335,
        495,
        130,
        6
      )
      .strokeColor("#D1D5DB")
      .lineWidth(1)
      .stroke();

    // Nom
    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(
        "Nom",
        70,
        358
      );

    doc
      .font("Helvetica")
      .text(
        birth.childLastname || "-",
        190,
        358
      );

    // Prénom
    doc
      .font("Helvetica-Bold")
      .text(
        "Prénom",
        70,
        387
      );

    doc
      .font("Helvetica")
      .text(
        birth.childFirstname || "-",
        190,
        387
      );

    // Date
    doc
      .font("Helvetica-Bold")
      .text(
        "Date de naissance",
        70,
        416
      );

    doc
      .font("Helvetica")
      .text(
        new Date(
          birth.birthDate
        ).toLocaleDateString("fr-FR"),
        190,
        416
      );

    // Lieu
    doc
      .font("Helvetica-Bold")
      .text(
        "Lieu de naissance",
        70,
        445
      );

    doc
      .font("Helvetica")
      .text(
        birth.birthPlace || "-",
        190,
        445
      );

    // Sexe
    doc
      .font("Helvetica-Bold")
      .text(
        "Sexe",
        390,
        358
      );

    doc
      .font("Helvetica")
      .text(
        birth.sex === "MALE"
          ? "Masculin"
          : "Féminin",
        450,
        358
      );

    // =====================================================
    // PARENTS
    // =====================================================

    doc
      .fillColor(GREEN)
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(
        "INFORMATIONS DES PARENTS",
        50,
        495
      );

    doc
      .rect(50, 516, 495, 2)
      .fill(YELLOW);

    doc
      .roundedRect(
        50,
        533,
        495,
        130,
        6
      )
      .fill("#FFFFFF");

    doc
      .roundedRect(
        50,
        533,
        495,
        130,
        6
      )
      .strokeColor("#D1D5DB")
      .lineWidth(1)
      .stroke();

    const parent = birth.parents?.[0];

    if (parent) {

      // PÈRE
      doc
        .fillColor(RED)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
          "PÈRE",
          70,
          554
        );

      doc
        .fillColor(DARK)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
          "Nom",
          70,
          582
        );

      doc
        .font("Helvetica")
        .text(
          parent.fatherName || "-",
          160,
          582
        );

      doc
        .font("Helvetica-Bold")
        .text(
          "Profession",
          70,
          608
        );

      doc
        .font("Helvetica")
        .text(
          parent.fatherJob || "-",
          160,
          608
        );

      // MÈRE
      doc
        .fillColor(GREEN)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
          "MÈRE",
          320,
          554
        );

      doc
        .fillColor(DARK)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
          "Nom",
          320,
          582
        );

      doc
        .font("Helvetica")
        .text(
          parent.motherName || "-",
          400,
          582
        );

      doc
        .font("Helvetica-Bold")
        .text(
          "Profession",
          320,
          608
        );

      doc
        .font("Helvetica")
        .text(
          parent.motherJob || "-",
          400,
          608
        );
    }

    // =====================================================
    // MENTIONS MARGINALES
    // =====================================================

    doc
      .fillColor(GREEN)
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(
        "MENTIONS MARGINALES",
        50,
        693
      );

    doc
      .rect(50, 714, 495, 2)
      .fill(YELLOW);

    doc
      .roundedRect(
        50,
        731,
        495,
        60,
        6
      )
      .strokeColor("#D1D5DB")
      .lineWidth(1)
      .stroke();

    doc
      .moveTo(64, 751)
      .lineTo(521, 751)
      .strokeColor("#D1D5DB")
      .lineWidth(0.5)
      .stroke();

    doc
      .moveTo(64, 771)
      .lineTo(521, 771)
      .strokeColor("#D1D5DB")
      .lineWidth(0.5)
      .stroke();

    // =====================================================
    // ZONE BAS DE PAGE
    // =====================================================

    // QR CODE

    doc.image(
      qrCode,
      55,
      809,
      {
        width: 80,
        height: 80
      }
    );

    doc
      .fillColor(GREY)
      .font("Helvetica")
      .fontSize(6.5)
      .text(
        "Scanner pour vérifier l'authenticité",
        45,
        894,
        {
          width: 100,
          align: "center"
        }
      );

    // =====================================================
    // VALIDATION
    // =====================================================

    doc
      .roundedRect(
        175,
        809,
        370,
        40,
        6
      )
      .fill("#ECFDF5");

    doc
      .fillColor(GREEN)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(
        "✓ ACTE VALIDÉ PAR L'OFFICIER D'ÉTAT CIVIL",
        175,
        823,
        {
          width: 370,
          align: "center"
        }
      );

    // =====================================================
    // AGENT
    // =====================================================

    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        "AGENT AYANT ENREGISTRÉ L'ACTE",
        175,
        858,
        {
          width: 370,
          align: "center"
        }
      );

    doc
      .fillColor(GREEN)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(
        birth.agentName || "-",
        175,
        876,
        {
          width: 370,
          align: "center"
        }
      );

    // =====================================================
    // PIED DE PAGE
    // =====================================================

    doc
      .fillColor(GREY)
      .font("Helvetica")
      .fontSize(7)
      .text(
        `Document généré électroniquement par le système SIVEC • ${new Date().getFullYear()}`,
        50,
        912,
        {
          width: 495,
          align: "center"
        }
      );

    // =====================================================
    // BANDE INFÉRIEURE
    // =====================================================

    doc
      .rect(0, PAGE_HEIGHT - 8, 198.4, 8)
      .fill(GREEN);

    doc
      .rect(198.4, PAGE_HEIGHT - 8, 198.4, 8)
      .fill(RED);

    doc
      .rect(396.8, PAGE_HEIGHT - 8, 198.5, 8)
      .fill(YELLOW);

    // =====================================================
    // TERMINER
    // =====================================================

    doc.end();

  } catch (error) {

    console.error(
      "❌ Erreur génération PDF :",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }
};