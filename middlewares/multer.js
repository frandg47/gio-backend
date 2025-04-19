// middlewares/multer.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
        return cb(null, true);
    }

    cb("Error: Tipo de archivo no permitido -" + fileTypes);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 9 * 1024 * 1024 } // 5MB máximo por archivo
});

module.exports = upload;
