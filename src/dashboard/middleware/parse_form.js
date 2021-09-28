const { IncomingForm } = require("formidable")
const { checkCSRF } = require("./csruf")

const parseForm = async (req, res, next) => {
    const form = new IncomingForm({
        keepExtensions: true,
        uploadDir: "./files/"
    })
    form.parse(req, async function (err, fields, files) {
        if (err) return next(err)
        req.body = fields
        req.files = files
        next()
    })
}

const parseFormAndCheckCSRF = async (req, res, next) => {
    return parseForm(req, res, (err) => {
        if (err) return next(err)
        return checkCSRF(req, res, next)
    })
}

module.exports = {
    parseForm,
    parseFormAndCheckCSRF
}
