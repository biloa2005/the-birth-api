import prisma from "../config/prisma.js"
export const createBirth=async(req,res)=>{
    try{
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
            motherJob
        }=req.body;
        //validation simple
         if (
            !childFirstname ||
            !childLastname ||
            !birthDate ||
            !birthPlace ||
            !sex ||
            !fatherName ||
            !motherName
        ) {

            return res.status(400).json({
                success:false,
                message:"Les champs obligatoires sont requis"
            });
        }
        //Generation numero acte
        const year=new Date().getFullYear();
        const count = await  prisma.birth.count({
            where:{
                createdAt:{
                gte:new Date(`${year}-01-01`),
                lt:new Date(`${year+1}-01-01`)
                }
            }
        });
        const actNumber=`YAO05-${year}-${String(count+1).padStart(6,"0")}`;
//creation naissance + parents + historique
const birth = await prisma.birth.create({

            data:{

                actNumber,

                childFirstname,
                childLastname,

                birthDate:new Date(birthDate),

                birthPlace,

                sex,

                status:"PENDING",

                centerId,

                createdBy:req.user?.id || "SYSTEM",


                parents:{
                    create:{
                        fatherName,
                        motherName,
                        fatherJob,
                        motherJob
                    }
                },


                histories:{
                    create:{
                        action:"CREATE",
                        userId:req.user?.id || "SYSTEM"
                    }
                }

            },


            include:{
                parents:true,
                histories:true
            }

        });
        // Enregistrer l'historique de modification
await prisma.birthHistory.create({
    data: {
    birthId: birth.id,
    action: "CREATE",
        userId: req.user?.id || "SYSTEM",
    },
});

return res.status(201).json({
    success:true,
    message:"naissance enregistree",
    data:{
          id:birth.id,
                actNumber:birth.actNumber
    }
})
    }catch(error){

        console.error(error);

        return res.status(500).json({

            success:false,
            message:"Erreur interne du serveur"

        });
    }
}
//AFFICHER TOUTE LES NAISSANCE
export const allBirth= async (req,res)=>{
try{
   const allBirth=await prisma.birth.findMany();
   res.status(200).json({
    success: true,
    allBirth

})
}catch(error){
  console.error(error?.stack || error);
  res.status(500).json({
    success:false,
    message:"erreur du serveur 🕵️‍♂️"
  });
}
}

//AFFICHER UNE NAISSANCE PAR ID


export const getBirthById = async (req, res) => {
  try {
    const { id } = req.params;

    const birth = await prisma.birth.findUnique({
      where: {
        id,
      },
      include: {
        parents: true,
        attachments: true,
        histories: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!birth) {
      return res.status(404).json({
        success: false,
        message: "Naissance introuvable",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Naissance récupérée avec succès",
      data: birth,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};