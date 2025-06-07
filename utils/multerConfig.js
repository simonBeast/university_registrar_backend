const AppExceptions = require('../utils/AppExceptions');
const multer = require('multer');
const path = require('path');

const multerStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, 'uploads/images')
    },
    filename:(req,file,cb)=>{
        const ext = file.mimetype.split('/')[1];
        cb(null,`user-${Math.floor(Math.random()*1000000)+1}-${Date.now()}.${ext}`)
    }

})
const multerFilter = (req, file, cb) => {
   const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (
    file.mimetype.startsWith('image') ||
    file.mimetype === 'application/pdf' ||
    (file.mimetype === 'application/octet-stream' && fileExt === '.pdf')
  ) {
    cb(null, true);
  } else {
    console.log(file);
    cb(new AppExceptions('Only images and PDFs are allowed.', 400), false);
  }
};
module.exports = multer({
    storage:multerStorage,
    fileFilter:multerFilter
})