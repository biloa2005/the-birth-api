import prisma from "../config/prisma.js";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

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
    // DOCUMENT A4
    // =====================================================

    const doc = new PDFDocument({

      size: "A4",

      margin: 0,

      autoFirstPage: true

    });


    // =====================================================
    // HEADERS
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
      .rect(0, 0, 595, 7)
      .fill(GREEN);

    doc
      .rect(198, 0, 199, 7)
      .fill(RED);

    doc
      .rect(397, 0, 198, 7)
      .fill(YELLOW);


    // =====================================================
    // EN-TÊTE
    // =====================================================

    doc
      .fillColor(GREEN)
      .font("Helvetica-Bold")
      .fontSize(16)
      .text(
        "RÉPUBLIQUE DU CAMEROUN",
        50,
        30,
        {
          width: 380,
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
        51,
        {
          width: 380,
          align: "center"
        }
      );


    // =====================================================
    // QR CODE HAUT DROITE
    // =====================================================

    // Pour laisser de la place en haut,
    // on ne met pas le QR ici.


    // =====================================================
    // LIGNE TRICOLORE
    // =====================================================

    doc
      .rect(50, 75, 165, 3)
      .fill(GREEN);

    doc
      .rect(215, 75, 165, 3)
      .fill(RED);

    doc
      .rect(380, 75, 165, 3)
      .fill(YELLOW);


    // =====================================================
    // TITRE
    // =====================================================

    doc
      .roundedRect(
        110,
        95,
        375,
        42,
        5
      )
      .fill(GREEN);


    doc
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .fontSize(17)
      .text(
        "ACTE DE NAISSANCE",
        110,
        108,
        {
          width: 375,
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
        50,
        155
      );


    doc
      .fillColor(RED)
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(
        birth.actNumber,
        50,
        170
      );


    // =====================================================
    // INFORMATIONS ENFANT
    // =====================================================

    doc
      .fillColor(GREEN)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(
        "INFORMATIONS DE L'ENFANT",
        50,
        205
      );


    doc
      .rect(50, 224, 495, 2)
      .fill(YELLOW);


    // Cadre

    doc
      .roundedRect(
        50,
        238,
        495,
        105,
        5
      )
      .fill(LIGHT);


    doc
      .roundedRect(
        50,
        238,
        495,
        105,
        5
      )
      .strokeColor("#D1D5DB")
      .lineWidth(1)
      .stroke();


    // Nom

    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        "Nom",
        70,
        255
      );

    doc
      .font("Helvetica")
      .text(
        birth.childLastname || "-",
        175,
        255
      );


    // Prénom

    doc
      .font("Helvetica-Bold")
      .text(
        "Prénom",
        70,
        278
      );

    doc
      .font("Helvetica")
      .text(
        birth.childFirstname || "-",
        175,
        278
      );


    // Date

    doc
      .font("Helvetica-Bold")
      .text(
        "Date de naissance",
        70,
        301
      );

    doc
      .font("Helvetica")
      .text(
        new Date(
          birth.birthDate
        ).toLocaleDateString("fr-FR"),
        175,
        301
      );


    // Lieu

    doc
      .font("Helvetica-Bold")
      .text(
        "Lieu de naissance",
        70,
        324
      );

    doc
      .font("Helvetica")
      .text(
        birth.birthPlace || "-",
        175,
        324
      );


    // Sexe

    doc
      .font("Helvetica-Bold")
      .text(
        "Sexe",
        390,
        255
      );

    doc
      .font("Helvetica")
      .text(
        birth.sex === "MALE"
          ? "Masculin"
          : "Féminin",
        445,
        255
      );


    // =====================================================
    // PARENTS
    // =====================================================

    doc
      .fillColor(GREEN)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(
        "INFORMATIONS DES PARENTS",
        50,
        365
      );


    doc
      .rect(50, 384, 495, 2)
      .fill(YELLOW);


    // Cadre parents

    doc
      .roundedRect(
        50,
        398,
        495,
        105,
        5
      )
      .fill("#FFFFFF");


    doc
      .roundedRect(
        50,
        398,
        495,
        105,
        5
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
        .fontSize(10)
        .text(
          "PÈRE",
          70,
          415
        );


      doc
        .fillColor(DARK)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(
          "Nom",
          70,
          438
        );


      doc
        .font("Helvetica")
        .text(
          parent.fatherName || "-",
          150,
          438
        );


      doc
        .font("Helvetica-Bold")
        .text(
          "Profession",
          70,
          460
        );


      doc
        .font("Helvetica")
        .text(
          parent.fatherJob || "-",
          150,
          460
        );


      // MÈRE

      doc
        .fillColor(GREEN)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
          "MÈRE",
          320,
          415
        );


      doc
        .fillColor(DARK)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(
          "Nom",
          320,
          438
        );


      doc
        .font("Helvetica")
        .text(
          parent.motherName || "-",
          380,
          438
        );


      doc
        .font("Helvetica-Bold")
        .text(
          "Profession",
          320,
          460
        );


      doc
        .font("Helvetica")
        .text(
          parent.motherJob || "-",
          380,
          460
        );

    }


    // =====================================================
    // ZONE BAS DE PAGE
    // =====================================================

    // QR CODE

    doc.image(
      qrCode,
      55,
      535,
      {
        width: 90,
        height: 90
      }
    );


    // Texte QR

    doc
      .fillColor(GREY)
      .font("Helvetica")
      .fontSize(7)
      .text(
        "Scanner pour vérifier l'authenticité",
        45,
        628,
        {
          width: 110,
          align: "center"
        }
      );


    // =====================================================
    // VALIDATION
    // =====================================================

    doc
      .roundedRect(
        175,
        535,
        370,
        42,
        5
      )
      .fill("#ECFDF5");


    doc
      .fillColor(GREEN)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(
        "✓ ACTE VALIDÉ PAR L'OFFICIER D'ÉTAT CIVIL",
        175,
        550,
        {
          width: 370,
          align: "center"
        }
      );


    // =====================================================
    // SIGNATURE
    // =====================================================

    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        "L'OFFICIER D'ÉTAT CIVIL",
        370,
        600,
        {
          width: 175,
          align: "center"
        }
      );


    doc
      .fillColor(GREY)
      .font("Helvetica")
      .fontSize(8)
      .text(
        "Signature et cachet",
        370,
        625,
        {
          width: 175,
          align: "center"
        }
      );


    // =====================================================
    // TEXTE DE VÉRIFICATION
    // =====================================================

    doc
      .fillColor(GREY)
      .font("Helvetica")
      .fontSize(7)
      .text(
        "Ce document est généré électroniquement par le système SIVEC.",
        150,
        670,
        {
          width: 395,
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
        `Document généré par le système SIVEC • ${new Date().getFullYear()}`,
        50,
        790,
        {
          width: 495,
          align: "center"
        }
      );


    // Bande inférieure

    doc
      .rect(0, 820, 198, 7)
      .fill(GREEN);

    doc
      .rect(198, 820, 199, 7)
      .fill(RED);

    doc
      .rect(397, 820, 198, 7)
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