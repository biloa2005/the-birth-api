import prisma from "../config/prisma.js";
import PDFDocument from "pdfkit";


export const printBirth = async (req, res) => {

  try {

    const { id } = req.params;


    // Recherche de l'acte
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
        success:false,
        message:"Acte de naissance introuvable"
      });

    }


    // Uniquement les actes validés peuvent être imprimés
    if (birth.status !== "APPROVED") {

      return res.status(400).json({

        success:false,
        message:"Cet acte n'est pas encore validé"

      });

    }


    // Création du PDF
    const doc = new PDFDocument();


    // Configuration de la réponse HTTP
    res.setHeader(
      "Content-Type",
      "application/pdf"
    );


    res.setHeader(
      "Content-Disposition",
      `inline; filename=acte-${birth.actNumber}.pdf`
    );


    // Envoyer le PDF directement au navigateur
    doc.pipe(res);



    // Contenu du document

    doc
      .fontSize(18)
      .text(
        "REPUBLIQUE DU CAMEROUN",
        {
          align:"center"
        }
      );


    doc.moveDown();


    doc
      .fontSize(16)
      .text(
        "ACTE DE NAISSANCE",
        {
          align:"center"
        }
      );


    doc.moveDown(2);


    doc.fontSize(12);


    doc.text(
      `Numéro de l'acte : ${birth.actNumber}`
    );


    doc.moveDown();


    doc.text(
      `Nom : ${birth.childLastname}`
    );


    doc.text(
      `Prénom : ${birth.childFirstname}`
    );


    doc.text(
      `Date de naissance : ${birth.birthDate.toLocaleDateString()}`
    );


    doc.text(
      `Lieu de naissance : ${birth.birthPlace}`
    );


    doc.text(
      `Sexe : ${birth.sex}`
    );


    doc.moveDown();



    // Informations parents

    if (birth.parents.length > 0) {


      const parent = birth.parents[0];


      doc.text(
        `Père : ${parent.fatherName}`
      );


      doc.text(
        `Profession du père : ${parent.fatherJob || "-"}`
      );


      doc.text(
        `Mère : ${parent.motherName}`
      );


      doc.text(
        `Profession de la mère : ${parent.motherJob || "-"}`
      );

    }


    doc.moveDown(2);


    doc.text(
      "Signature de l'officier d'état civil",
      {
        align:"right"
      }
    );


    // Terminer le PDF
    doc.end();


  } catch(error) {

    console.error(error);


    return res.status(500).json({

      success:false,
      message:"Erreur interne du serveur"

    });

  }

};