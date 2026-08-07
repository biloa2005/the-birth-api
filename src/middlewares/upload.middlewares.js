import multer from "multer";
import path from "path";
import fs from "fs";
//dossier sur lequelle seront stocké les fichiers
const  uploadPath="uploads/births";
// verifier si le dossier existe
// s il n'existe pas il est creer automatiquent
if(!fs.existsSync(uploadPath)){
    fs.mkdirSync(uploadPath, {recursive:true});

}
// configuration de l'emplacement et du nom des fichier 
const storage=multer.diskStorage({
    //definissons le dossier de destination
    destination(req,file,cb){
        //cb(error,destination)
        cb(null,uploadPath)
    },
    //generer le nom du fichier
    filename(req,file,cb){
        //Recuperer l'extension du fichier 
        const ext=path.extname(file.originalname)
    //generation d'un nom unique
    cb(null,
        `${Date.now()}-${Math.round(Math.random()*100000)}${ext}`
    );
    },

})
// filtrer les types de fichier autorises
const fileFilter=(req,file,cb)=>{
    //liste de type de fichier atauriser
    console.log(file);
    console.log(file.mimetype);

    const allowed=[
         "application/pdf",

    "image/jpeg",

    "image/png",

    "image/jpg",
    ];
    if(allowed.includes(file.mimetype)){
        cb(null,true);
    }else{
        // le fichier est refuser
        cb(new Error("format de fichier non  autoriser"))
    }
};
//exportation de la configuration multer
export default multer({
    // configuration de stockage
    storage,
    //verif
    fileFilter,
    // limitation de la taille
    limits:{
        fileSize:5*1024*1024,

    },
});