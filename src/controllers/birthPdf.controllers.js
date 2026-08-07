import prisma from "../config/prisma.js";
import PDFDocument from "pdfkit";


export const printBirth = async (req, res) => {

  try {

    const { id } = req.params;


    const birth = await prisma.birth.findUnique({

      where:{ id },

      include:{
        parents:true
      }

    });


    if(!birth){

      return res.status(404).json({
        success:false,
        message:"Acte introuvable"
      });

    }


    if(birth.status !== "APPROVED"){

      return res.status(400).json({
        success:false,
        message:"Cet acte n'est pas encore validé"
      });

    }



    const doc = new PDFDocument({
      size:"A4",
      margin:50
    });



    res.setHeader(
      "Content-Type",
      "application/pdf"
    );


    res.setHeader(
      "Content-Disposition",
      `inline; filename=acte-${birth.actNumber}.pdf`
    );


    doc.pipe(res);



    // ==========================
    // EN-TETE
    // ==========================


    doc
    .fillColor("#003366")
    .fontSize(18)
    .text(
      "REPUBLIQUE DU CAMEROUN",
      {
        align:"center"
      }
    );


    doc
    .fontSize(12)
    .fillColor("#000")
    .text(
      "Paix - Travail - Patrie",
      {
        align:"center"
      }
    );


    doc.moveDown();



    // Ligne séparatrice

    doc
    .strokeColor("#003366")
    .lineWidth(2)
    .moveTo(50,130)
    .lineTo(545,130)
    .stroke();



    doc.moveDown(2);



    // ==========================
    // TITRE
    // ==========================


    doc
    .fillColor("#ffffff")
    .rect(120,160,350,40)
    .fill("#003366");


    doc
    .fillColor("#ffffff")
    .fontSize(18)
    .text(
      "ACTE DE NAISSANCE",
      120,
      172,
      {
        width:350,
        align:"center"
      }
    );



    doc.moveDown(4);



    // ==========================
    // NUMERO ACTE
    // ==========================


    doc
    .fillColor("#000")
    .fontSize(12)
    .text(
      `Numéro de l'acte : ${birth.actNumber}`
    );


    doc.moveDown();



    // ==========================
    // INFORMATIONS ENFANT
    // ==========================


    doc
    .fillColor("#003366")
    .fontSize(14)
    .text("Informations de l'enfant");


    doc.moveDown(0.5);



    doc
    .fillColor("#000")
    .fontSize(12);



    const startY = doc.y;


    // cadre enfant

    doc
    .strokeColor("#003366")
    .rect(
      50,
      startY-10,
      495,
      120
    )
    .stroke();



    doc.text(
      `Nom : ${birth.childLastname}`,
      70,
      startY+10
    );


    doc.text(
      `Prénom : ${birth.childFirstname}`,
      70,
      startY+30
    );


    doc.text(
      `Date de naissance : ${birth.birthDate.toLocaleDateString()}`,
      70,
      startY+50
    );


    doc.text(
      `Lieu de naissance : ${birth.birthPlace}`,
      70,
      startY+70
    );


    doc.text(
      `Sexe : ${birth.sex}`,
      70,
      startY+90
    );



    doc.moveDown(8);



    // ==========================
    // PARENTS
    // ==========================


    doc
    .fillColor("#003366")
    .fontSize(14)
    .text("Informations des parents");


    doc.moveDown();



    const parent = birth.parents[0];


    if(parent){


      doc
      .fillColor("#000")
      .fontSize(12);


      doc.text(
        `Père : ${parent.fatherName}`
      );


      doc.text(
        `Profession père : ${parent.fatherJob || "-"}`
      );


      doc.moveDown();


      doc.text(
        `Mère : ${parent.motherName}`
      );


      doc.text(
        `Profession mère : ${parent.motherJob || "-"}`
      );

    }



    doc.moveDown(3);



    // ==========================
    // VALIDATION
    // ==========================


    doc
    .fillColor("green")
    .fontSize(13)
    .text(
      "Acte validé par l'officier d'état civil",
      {
        align:"center"
      }
    );


    doc.moveDown(3);



    // ==========================
    // SIGNATURE
    // ==========================


    doc
    .fillColor("#000")
    .fontSize(12)
    .text(
      "L'officier d'état civil",
      {
        align:"right"
      }
    );


    doc.moveDown(3);


    doc.text(
      "Signature et cachet",
      {
        align:"right"
      }
    );



    // pied de page

    doc
    .fontSize(9)
    .fillColor("#666")
    .text(
      `Document généré par le système SIVEC - ${new Date().getFullYear()}`,
      50,
      780,
      {
        align:"center",
        width:495
      }
    );



    doc.end();



  } catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:"Erreur interne du serveur"
    });

  }

};