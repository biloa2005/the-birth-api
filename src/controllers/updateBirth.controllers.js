import prisma from "../config/prisma.js";
export const updateBirth =async (req,res,)=>{
    try{
        const {id}=req.params;
        const body=req.body;
        //verifions que l'acte existe
        const birth=await prisma.birth.findUnique({
            where:{id},

        });
        if(!birth){
            return res.status(404).json({
                success:false,
                message:"naissance introuver"
            });
            
        }
        //une naissance approuver ne peut pas etres  approuver
        if(birth.status==="APPROVED"){
            return res.status(400).json({
                success:false,
                message:"Une naissance validee ne peut plus etre modifier"
            })
        }
        //constrution des donnees a modifier
        const data={};
        if(body.childFirstname !== undefined)
            data.childFirstname=body.childFirstname;
        if (body.childLastname !== undefined)
      data.childLastname = body.childLastname;

    if (body.birthDate !== undefined)
      data.birthDate = new Date(body.birthDate);

    if (body.birthPlace !== undefined)
      data.birthPlace = body.birthPlace;

    if (body.sex !== undefined)
      data.sex = body.sex;

    if (body.centerId !== undefined)
      data.centerId = body.centerId;

    if (body.status !== undefined)
      data.status = body.status;

    // Mise à jour de l'acte
const updatedBirth= await prisma.birth.update({
    where:{id},
    data,
});
//mise a jour des parent si envoyer
if(
     body.fatherName !== undefined ||
      body.motherName !== undefined ||
      body.fatherJob !== undefined ||
      body.motherJob !== undefined
){
     const parentData = {};

      if (body.fatherName !== undefined)
        parentData.fatherName = body.fatherName;

      if (body.motherName !== undefined)
        parentData.motherName = body.motherName;

      if (body.fatherJob !== undefined)
        parentData.fatherJob = body.fatherJob;

      if (body.motherJob !== undefined)
        parentData.motherJob = body.motherJob;

      await prisma.birthParent.updateMany({
        where: { birthId: id },
        data: parentData,
      });
}
return res.status(200).json({
     success: true,
      message: "Naissance modifiée avec succès",
      data: updatedBirth,
})
}catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
     message: error.message,
    });
    
  }
}
// lion