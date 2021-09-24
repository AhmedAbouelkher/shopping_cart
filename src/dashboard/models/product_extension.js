const { Product } = require("../../models/product")

const getNumOfNewlyAddedProducts = async (limitInDays = 10) => {
    const diff = new Date(Date.now() - limitInDays * 24 * 60 * 60 * 1000)
    const productsCount = await Product.find({ createdAt: { $gt: diff } })
        .count()
        .exec()
    return productsCount
}

module.exports = {
    getNumOfNewlyAddedProducts
}
