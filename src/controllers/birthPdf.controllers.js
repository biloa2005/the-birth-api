import prisma from "../config/prisma.js";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

// =====================================================
// FORMAT DE PAGE PERSONNALISÉ : 16 cm x 33 cm
// (taille du format inchangée — ne pas modifier)
// =====================================================

const CM = 28.3465;
const PAGE_WIDTH = 16 * CM;
const PAGE_HEIGHT = 33 * CM;

// =====================================================
// GRILLE DE MISE EN PAGE CALCULÉE DYNAMIQUEMENT
// (au lieu de valeurs fixes copiées d'un format A4,
// tout est dérivé de PAGE_WIDTH => contenu toujours
// centré, quelle que soit la taille du format)
// =====================================================

const MARGIN = 30;
const CONTENT_X = MARGIN;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CONTENT_RIGHT = PAGE_WIDTH - MARGIN;

// Colonnes label / valeur (proportionnelles à la largeur du contenu)
const LABEL_X = CONTENT_X + 15;
const VALUE_X_ENFANT = CONTENT_X + Math.round(CONTENT_WIDTH * 0.3);
const VALUE_X_PARENT = CONTENT_X + Math.round(CONTENT_WIDTH * 0.22);

// Zone QR code / bloc de validation
const QR_SIZE = 64;
const QR_X = CONTENT_X;
const VALID_GAP = 20;
const VALID_X = QR_X + QR_SIZE + VALID_GAP;
const VALID_WIDTH = CONTENT_WIDTH - QR_SIZE - VALID_GAP;

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
    // DOCUMENT — FORMAT 16 x 33 cm (inchangé)
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
    // BANDE SUPÉRIEURE (pleine largeur réelle de la page)
    // =====================================================

    const bandWidth = PAGE_WIDTH / 3;

    

    // =====================================================
    // EN-TÊTE (centré sur la largeur réelle du contenu)
    // =====================================================

    doc
      .fillColor(GREEN)
      .font("Helvetica-Bold")
      .fontSize(15)
      .text(
        "RÉPUBLIQUE DU CAMEROUN",
        CONTENT_X,
        28,
        {
          width: CONTENT_WIDTH,
          align: "center"
        }
      );

    doc
      .fillColor(DARK)
      .font("Helvetica")
      .fontSize(8.5)
      .text(
        "Paix - Travail - Patrie",
        CONTENT_X,
        49,
        {
          width: CONTENT_WIDTH,
          align: "center"
        }
      );

    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(
        "MINISTÈRE DE LA DÉCENTRALISATION ET DU DÉVELOPPEMENT LOCAL",
        CONTENT_X,
        67,
        {
          width: CONTENT_WIDTH,
          align: "center"
        }
      );

    // =====================================================
    // LIGNE TRICOLORE (répartie sur la largeur du contenu)
    // =====================================================

    const lineSeg = CONTENT_WIDTH / 3;

    doc
      .rect(CONTENT_X, 154, lineSeg, 3)
      .fill(GREEN);

    doc
      .rect(CONTENT_X + lineSeg, 154, lineSeg, 3)
      .fill(RED);

    doc
      .rect(CONTENT_X + lineSeg * 2, 154, CONTENT_WIDTH - lineSeg * 2, 3)
      .fill(YELLOW);

    // =====================================================
    // TITRE (centré)
    // =====================================================

    doc
      .fillColor("#181717")
      .font("Helvetica-Bold")
      .fontSize(18)
      .text(
        "ACTE DE NAISSANCE",
        CONTENT_X,
        187,
        {
          width: CONTENT_WIDTH,
          align: "center"
        }
      );

    // =====================================================
    // NUMÉRO ACTE
    // =====================================================

    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        "NUMÉRO DE L'ACTE",
        CONTENT_X,
        238
      );

    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(
        birth.actNumber,
        CONTENT_X,
        255
      );

    // =====================================================
    // INFORMATIONS ENFANT
    // =====================================================

    doc
      
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(
        "INFORMATIONS DE L'ENFANT",
        CONTENT_X,
        297,
       
      );

    // Nom
    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .text(
        "Nom",
        LABEL_X,
        358
      );

    doc
      .font("Helvetica")
      .text(
        birth.childLastname || "-",
        VALUE_X_ENFANT,
        358
      );

    // Prénom
    doc
      .font("Helvetica-Bold")
      .text(
        "Prénom",
        LABEL_X,
        387
      );

    doc
      .font("Helvetica")
      .text(
        birth.childFirstname || "-",
        VALUE_X_ENFANT,
        387
      );

    // Date
    doc
      .font("Helvetica-Bold")
      .text(
        "Date de naissance",
        LABEL_X,
        416
      );

    doc
      .font("Helvetica")
      .text(
        new Date(
          birth.birthDate
        ).toLocaleDateString("fr-FR"),
        VALUE_X_ENFANT,
        416
      );

    // Lieu
    doc
      .font("Helvetica-Bold")
      .text(
        "Lieu de naissance",
        LABEL_X,
        445
      );

    doc
      .font("Helvetica")
      .text(
        birth.birthPlace || "-",
        VALUE_X_ENFANT,
        445
      );

    // Sexe
    doc
      .font("Helvetica-Bold")
      .text(
        "Sexe",
        LABEL_X,
        476
      );

    doc
      .font("Helvetica")
      .text(
        birth.sex === "MALE"
          ? "Masculin"
          : "Féminin",
        VALUE_X_ENFANT,
        476
      );

    // =====================================================
    // PARENTS
    // =====================================================

    doc
      
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(
        "INFORMATIONS DES PARENTS",
        CONTENT_X,
        495,
       
      );

    const parent = birth.parents?.[0];

    if (parent) {

      // PÈRE
      doc
        .fillColor(DARK)
        .font("Helvetica-Bold")
        .fontSize(10.5)
        .text(
          "PÈRE",
          LABEL_X,
          554
        );

      doc
        .fillColor(DARK)
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .text(
          "Nom",
          LABEL_X,
          582
        );

      doc
        .font("Helvetica")
        .text(
          parent.fatherName || "-",
          VALUE_X_PARENT,
          582
        );

      doc
        .font("Helvetica-Bold")
        .text(
          "Profession",
          LABEL_X,
          608
        );

      doc
        .font("Helvetica")
        .text(
          parent.fatherJob || "-",
          VALUE_X_PARENT,
          608
        );

      // MÈRE
      doc
        .fillColor(DARK)
        .font("Helvetica-Bold")
        .fontSize(10.5)
        .text(
          "MÈRE",
          LABEL_X,
          629
        );

      doc
        .fillColor(DARK)
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .text(
          "Nom",
          LABEL_X,
          646
        );

      doc
        .font("Helvetica")
        .text(
          parent.motherName || "-",
          VALUE_X_PARENT,
          646
        );

      doc
        .font("Helvetica-Bold")
        .text(
          "Profession",
          LABEL_X,
          667
        );

      doc
        .font("Helvetica")
        .text(
          parent.motherJob || "-",
          VALUE_X_PARENT,
          667
        );
    }

    // =====================================================
    // MENTIONS MARGINALES
    // =====================================================

    doc
      
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(
        "MENTIONS MARGINALES",
        CONTENT_X,
        693,
        {
          width: CONTENT_WIDTH,
          align: "center"
        }
      );

    doc
      .roundedRect(
        CONTENT_X,
        731,
        CONTENT_WIDTH,
        60,
        6
      )
      .strokeColor("#D1D5DB")
      .lineWidth(1)
      .stroke();

    doc
      .moveTo(CONTENT_X + 14, 751)
      .lineTo(CONTENT_RIGHT - 24, 751)
      .strokeColor("#D1D5DB")
      .lineWidth(0.5)
      .stroke();

    doc
      .moveTo(CONTENT_X + 14, 771)
      .lineTo(CONTENT_RIGHT - 24, 771)
      .strokeColor("#D1D5DB")
      .lineWidth(0.5)
      .stroke();

    // =====================================================
    // ZONE BAS DE PAGE
    // =====================================================

    // QR CODE

    doc.image(
      qrCode,
      QR_X,
      809,
      {
        width: QR_SIZE,
        height: QR_SIZE
      }
    );

    doc
      .fillColor(GREY)
      .font("Helvetica")
      .fontSize(6)
      .text(
        "Scanner pour vérifier l'authenticité",
        QR_X,
        881,
        {
          width: QR_SIZE,
          align: "center"
        }
      );

    // =====================================================
    // VALIDATION
    // =====================================================

    doc
      .roundedRect(
        VALID_X,
        809,
        VALID_WIDTH,
        40,
        6
      )
      .fill("#ECFDF5");

    doc
      .fillColor(GREEN)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        "✓ ACTE VALIDÉ PAR L'OFFICIER D'ÉTAT CIVIL",
        VALID_X,
        822,
        {
          width: VALID_WIDTH,
          align: "center"
        }
      );

    // =====================================================
    // AGENT
    // =====================================================

    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .text(
        "AGENT AYANT ENREGISTRÉ L'ACTE",
        VALID_X,
        858,
        {
          width: VALID_WIDTH,
          align: "center"
        }
      );

    doc
      
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .text(
        birth.agentName || "-",
        VALID_X,
        876,
        {
          width: VALID_WIDTH,
          align: "center"
        }
      );

    // =====================================================
    // PIED DE PAGE
    // =====================================================

    doc
      .fillColor(GREY)
      .font("Helvetica")
      .fontSize(6.5)
      .text(
        `Document généré électroniquement par le système SIVEC • ${new Date().getFullYear()}`,
        CONTENT_X,
        912,
        {
          width: CONTENT_WIDTH,
          align: "center"
        }
      );

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