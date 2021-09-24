const mongoose = require("mongoose")
const {
    validateCreateProduct,
    validateUpdateProduct
} = require("../validation/product")

const { Order } = require("./order")

//https://www.npmjs.com/package/mongoose-paginate-v2
const mongoosePaginate = require("mongoose-paginate-v2")
const { createError } = require("../utilities/error_handling")
const createHttpError = require("http-errors")
const { calculatePaginationOffset } = require("../utilities/pagination")

const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            text: true
        },
        price: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

schema.plugin(mongoosePaginate)

schema.pre("deleteOne", { document: false, query: true }, async function () {
    const doc = await this.model.findOne(this.getFilter())
    await Order.updateMany({ "items.item.productId": doc._id })
})

const Product = mongoose.model("Product", schema)

const fetchProducts = async (page, query = null) => {
    const offset = calculatePaginationOffset(page)
    let filter = {}
    if (query) {
        //https://stackoverflow.com/questions/10610131/checking-if-a-field-contains-a-string
        // filter = { $text: { $search: 'query' } };
        filter = { name: { $regex: query } }
    }
    const products = await Product.paginate(filter, {
        offset,
        sort: { createdAt: -1 }
    })
    return products
}

const createProduct = async (payload) => {
    const errors = await validateCreateProduct(payload)
    if (errors) throw createError(errors, 422, null)

    const product = await Product.create(payload)
    return product
}

const findProductById = async (id) => {
    try {
        const product = await Product.findById(id)
        return product
    } catch (error) {
        throw createHttpError(404, "Product was not found")
    }
}

const updateProductById = async (id, payload) => {
    const errors = await validateUpdateProduct(payload)
    if (errors) throw createError(errors, 422, null)

    const product = await Product.findByIdAndUpdate(id, payload, { new: true })
    return product
}

const deleteProductById = async (id) => {
    const product = await Product.findByIdAndDelete(id)
    return product
}

module.exports = {
    Product,
    fetchProducts,
    createProduct,
    findProductById,
    updateProductById,
    deleteProductById
}
