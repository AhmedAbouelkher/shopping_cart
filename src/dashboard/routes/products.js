const router = require("express").Router();

const { IncomingForm } = require("formidable");

const {
  fetchProducts,
  findProductById,
  createProduct,
  updateProductById,
} = require("../../models/product");

const { isAuth } = require("../middleware/auth");
const { convertToViewError, createViewError } = require("../../utilities/error_handling");
const { uniqueId } = require("lodash");


router.use(isAuth);

//Fetch all products
router.get("/", async (req, res, next) => {
  const page = req.query.page;
  const query = req.body.q || req.query.q;
  try {
    const productsResponse = await fetchProducts(page, query);
    //https://stackoverflow.com/questions/18931452/node-js-get-path-from-the-request
    //https://stackoverflow.com/questions/12525928/how-to-get-request-path-with-express-req-object
    const url = new URL(req.originalUrl, `http://${req.headers.host}`)

    res.render("products/index", {
      products: productsResponse.docs,
      data: {
        totalPages: productsResponse.totalPages,
        currentPage: productsResponse.page,
        prevPage: productsResponse.prevPage,
        nextPage: productsResponse.nextPage,
      },
      // baseUrl: req.originalUrl,
      url,
      query
    });
  } catch (error) {
    console.log(error)
    next(convertToViewError(error));
  }
});

// Create new product
router.get("/create", (req, res, next) => {
  res.render("products/create");
});

router.post("/create", (req, res, next) => {
  const form = new IncomingForm({
    keepExtensions: true,
    uploadDir: "./files/",
  });
  form.parse(req, async function (err, fields, files) {
    if (err) return next(err);
    try {
      console.log(files, '+++', fields)
      const { path, name, type } = files.image;
      const payload = fields;
      payload.image = path;
      await createProduct(payload);
      return res.redirect("/dashboard/products");
    } catch (error) {
      console.log(error)
      next(convertToViewError(error));
    }
  });
});

// View
router.get("/:id/edit", async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await findProductById(id);
    res.render("products/edit", { product });
  } catch (error) {
    next(convertToViewError(error));
  }
});

// update product
router.post("/:id/edit", isAuth, (req, res, next) => {
  const id = req.params.id;
  const form = new IncomingForm({
    keepExtensions: true,
    uploadDir: "./files/",
  });

  form.parse(req, async function (err, fields, files) {
    if (err) return next(err);
    try {
      const payload = fields;
      const { path, size } = files.image;
      if (size > 0) {
        payload.image = path;
      }
      console.log(payload);
      await updateProductById(id, payload);
      return res.redirect("/dashboard/products");
    } catch (error) {
      next(convertToViewError(error));
    }
  });
});

router.post('/upload', (req, res, next) => {
  const form = new IncomingForm({
    keepExtensions: true,
    uploadDir: "./files/",
  });
  form.parse(req, async function (err, fields, files) {
    console.log(files.file.path)
    res.send({msg: 'success'})
  });
})

// delete product

// view product
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await findProductById(id);
    res.send(product);
  } catch (error) {
    next(convertToViewError(error));
  }
});

module.exports = router;
