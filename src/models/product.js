const mongoose = require('mongoose');

const schema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please include the product name"],
    },
    price: {
        type: String,
        required: [true, "Please include the product price"],
    },
    image: {
        type: String,
        required: true,
    },
}, {
    timeStamps: true
})

const Product = mongoose.model('Product', schema)

module.exports = Product

exports.products = async() => {
    const products = await Product.find({});
    return products;
}

exports.createProduct = async payload => {
    //TODO: validate create
    const product = await Product.create(payload)
    return product
}

exports.findProductById = async id => {
    const product = await Product.findById(id)
    return product
}

exports.updateProductById = async(id, payload) => {
    //TODO: validate update
    const product = await Product.findByIdAndUpdate(id, payload, { new: true })
    return product
}

exports.deleteProduct = async id => {
    const product = await Product.findByIdAndDelete(id)
    return product
}