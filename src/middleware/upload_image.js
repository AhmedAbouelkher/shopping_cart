const createHttpError = require('http-errors');
const multer = require('multer');
const p = require('path');

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, p.join("./files/"));
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + "@" + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.', 400), false);
    }
}

const handleError = (err, req, res, next) => {
    if (err.message === 'Unexpected field') {
        return next(createHttpError(400, "Provided file field name is invalid"))
    }
    next(err)
}

module.exports = {
    uploadImage: multer({
        storage,
        limits: {
            fileSize: 1024 * 1024 * 6
        },
        fileFilter,
    }),
    handleError
}