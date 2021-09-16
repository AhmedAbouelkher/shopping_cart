const router = require('express').Router();
const { Product, fetchProducts, findProductById } = require('../../models/product')
const { isAuthanticated } = require('../passport')

router.use(isAuthanticated)

//Fetch all products
router.get('/', async(req, res, next) => {
    try {
        const allProducts = await fetchProducts()

        res.render('products/index', {
            products: [{
                _id: "sdasdsada",
                name: "product_name",
                image: "product_image",
                price: 20,
            }]
        })
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
})

// Create new product
router.get('/create', (req, res, next) => {
    res.render('products/create')
})

const formidable = require('formidable');

router.post('/create', (req, res, next) => {
    var form = new formidable.IncomingForm();
    form.parse(req)
        .on('field', function(name, field) {
            console.log(name, field)
        })
        .on('file', function(name, file) {
            console.log("FILE", name, file)
        })
        .on('error', function(err) {
            res.send({ 'success': false, error: err });
        })
        .on('end', function() {
            res.send({ 'success': true });
        });
})

// update product
// delete product

// view product
router.get('/:id', async(req, res, next) => {
    try {
        const id = req.params.id
        const product = await findProductById(id)
        res.send(product)
    } catch (error) {
        next(error)
    }
})


module.exports = router