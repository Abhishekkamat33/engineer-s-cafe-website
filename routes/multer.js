const multer = require('multer');
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        cb(null, `user-${Date.now()}.jpeg`);
    }
});

const filter = function(req, file, cb) {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error("Not an image"));
    }
}

const upload = multer({ storage: storage, fileFilter: filter }); // corrected fileFilter option

module.exports = upload;
