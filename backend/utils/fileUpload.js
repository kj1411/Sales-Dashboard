import multer from "multer";

// file destination and filename configurations
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, new Date().toISOString().replace(/:/g,"-") + "-" +  file.originalname)
    }
});

// Filter which files to accept
const fileFilter = (req,file,cb)=>{
    if(
        file.mimetype === "image/png" || 
        file.mimetype === "image/jpg" || 
        file.mimetype === "image/jpeg"
    ){
        cb(null,true);
    }
    else{
        cb(null,false);
    }
}

export const formatFileSize = (bytes, decimal)=> {
    if (bytes === 0) return '0 Bytes';
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const k = 1024;
    const dm = decimal || 0;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + units[i];
}

export const uploader = multer({
    storage,
    fileFilter,
});