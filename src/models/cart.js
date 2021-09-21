const mongoose = require("mongoose")
const { findProductById } = require("./product")
const {
    validateAddProductToCart,
    validateUpdateProductQuantity
} = require("../validation/product")
const { createError } = require("../utilities/error_handling")
const createHttpError = require("http-errors")

const itemShema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Types.ObjectId,
            ref: "Product"
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
)

const cartSchema = new mongoose.Schema(
    {
        items: [itemShema],
        subTotal: {
            default: 0,
            type: Number
        },
        owner: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
)

const Cart = mongoose.model("Cart", cartSchema)

const getItemMongooseSchema = () => {
    return itemShema
}

const fetchOrCreateCartByUserId = async (userId) => {
    let cart = await Cart.findOne({ owner: userId })
    if (!cart) cart = await _getEmptyCart(userId)
    return cart
}

const _getEmptyCart = async (userId) => {
    const cart = new Cart({
        items: [],
        owner: mongoose.Types.ObjectId(userId)
    })
    await cart.save()
    return cart
}

const addProductToCartByUserId = async (
    userId,
    { productId, quantity = 1 }
) => {
    const errors = await validateAddProductToCart({ productId, quantity })
    if (errors)
        throw createError(errors, 422, "The givin product data is invalid")
    const product = await findProductById(productId)
    const cart = await fetchOrCreateCartByUserId(userId)
    const item = await _checkAndfetchProductInCartById(userId, product._id)
    if (!item) {
        const newItem = {
            productId: product._id,
            price: product.price,
            quantity,
            total: product.price * quantity
        }
        cart.items = cart.items.concat(newItem)
        cart.subTotal += newItem.total
    } else {
        const totalAddedPrice = item.price * quantity
        item.quantity += quantity
        item.total += totalAddedPrice
        cart.subTotal += totalAddedPrice
        await _updateItemInCart(userId, item)
    }

    await cart.save()
    return cart
}

const _checkAndfetchProductInCartById = async (userId, productId) => {
    //https://stackoverflow.com/questions/24187947/how-to-get-only-one-item-of-a-subdocument-in-mongoose
    const result = await Cart.findOne(
        {
            owner: userId,
            "items.productId": productId
        },
        { "items.$": 1 }
    )
    return result?.items[0]
}

const _updateItemInCart = async (userId, item) => {
    //https://docs.mongodb.com/manual/reference/operator/update/set/
    //https://docs.mongodb.com/manual/reference/operator/update/positional/
    //https://stackoverflow.com/questions/41501939/how-to-update-a-array-value-in-mongoose
    await Cart.updateOne(
        {
            owner: userId,
            "items.productId": item.productId
        },
        {
            $set: {
                "items.$.quantity": item.quantity,
                "items.$.total": item.total
            }
        }
    )
}

const removeProductFromCartByUserId = async (userId, productId) => {
    //check if the product exist in db
    const product = await findProductById(productId)
    //check if the product exist in cart
    const item = await _checkAndfetchProductInCartById(userId, product._id)
    if (!item) throw createHttpError(400, "Prodcut does not exist in cart")
    //remove item & update cart [subTotal]
    await _removeItemFromCart(userId, item)
}

const _removeItemFromCart = async (userId, item) => {
    //https://docs.mongodb.com/manual/reference/operator/update/pull/
    //https://docs.mongodb.com/manual/reference/operator/update/inc/
    const itemTotalPrice = item.total * -1
    await Cart.updateOne(
        { owner: userId },
        {
            $inc: { subTotal: itemTotalPrice },
            $pull: { items: { productId: item.productId } }
        }
    )
}

const updateProductQuantityInCartByUserId = async (
    userId,
    { productId, removedQuantity }
) => {
    const errors = await validateUpdateProductQuantity({
        productId,
        removedQuantity
    })
    if (errors)
        throw createError(errors, 422, "The givin product data is invalid")
    const item = await _checkAndfetchProductInCartById(userId, productId)
    if (!item) throw createHttpError(400, "Prodcut does not exist in cart")

    //Check if the quantity will be negative
    const isQuantityWillBeNegativeOrZero = item.quantity + removedQuantity <= 0
    if (isQuantityWillBeNegativeOrZero)
        throw createHttpError(403, "Invalid [removedQuantity]")

    const cart = await fetchOrCreateCartByUserId(userId)

    item.quantity += removedQuantity
    const negativeReductionInItemPrice = item.price * removedQuantity
    item.total += negativeReductionInItemPrice
    cart.subTotal += negativeReductionInItemPrice

    await _updateItemInCart(userId, item)
    await cart.save()
}

const deleteUserCart = async (userId) => {
    await Cart.deleteOne({ owner: mongoose.Types.ObjectId(userId) })
}

module.exports = {
    fetchUserCartByUserId: fetchOrCreateCartByUserId,
    addProductToCartByUserId,
    removeProductFromCartByUserId,
    updateProductQuantityInCartByUserId,
    deleteUserCart,
    getItemMongooseSchema
}

/*
    [new] --> if the product is not in the cart
    - create new item. *
    - add the product to the cart. *
    - upadate cart [subTotal]. * 

            [Old] -> if the product already in cart
        - Do NOT add the product again.
        - get the old item from cart.
        - increment item's [quantity] and [total]
        - re-calculate the cart [subTotal]
    */
