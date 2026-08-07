import prisma from "../config/prisma.js";


export const getBirthHistory = async (req,res)=>{

    try {

        const {id} = req.params;


        // Vérifier que la naissance existe
        const birth = await prisma.birth.findUnique({
            where:{
                id
            }
        });


        if(!birth){

            return res.status(404).json({
                success:false,
                message:"Naissance introuvable"
            });

        }


        // Récupérer l'historique
        const history = await prisma.birthHistory.findMany({

            where:{
                birthId:id
            },

            orderBy:{
                createdAt:"desc"
            }

        });



        return res.status(200).json({

            success:true,
            message:"Historique récupéré avec succès",
            data:history

        });


    } catch(error){

        console.error(error);


        return res.status(500).json({

            success:false,
            message:"Erreur interne du serveur"

        });

    }

};