const mongoose = require('mongoose')
const { findProductById } = require('./product')
const { validateAddProductToCart } = require('../validation/product')
const { createError } = require('../utilities/error_handling')

const itemShema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
        },
        total: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

const cartSchema = new mongoose.Schema(
    {
        items: [itemShema],
        subTotal: {
            default: 0,
            type: Number,
        },
        owner: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

const Cart = mongoose.model('Cart', cartSchema)

const _emptyCart = async (userId) => {
    const cart = new Cart({
        items: [],
        owner: mongoose.Types.ObjectId(userId),
    })
    await cart.save()
    return cart
}

const fetchOrCreateCartByUserId = async (userId) => {
    let cart = await Cart.findOne({ owner: userId })
    if (!cart) cart = await _emptyCart(userId)
    return cart
}

const fetchProductInCart = async (userId, productId) => {
    const result = await Cart.findOne(
        {
            owner: userId,
            'items.productId': productId,
        },
        { 'items.$': 1 }
    )
    return result?.items[0]
}

const addProductToCartByUserId = async (
    userId,
    { productId, quantity = 1 }
) => {
    const errors = await validateAddProductToCart({ productId, quantity })
    if (errors)
        throw createError(errors, 422, 'The givin product data is invalid')
    const product = await findProductById(productId)
    const cart = await fetchOrCreateCartByUserId(userId)
    // Check if the product in the cart
    const productInCart = fetchProductInCart(userId, product._id)
    if (!productInCart) {
        /*
    [new] --> if the product is not in the cart
    - create new item. *
    - add the product to the cart. *
    - upadate cart [subTotal]. * 
    */
        // throw new Error('trying to add new item ;(')
        const newItem = {
            productId: product._id,
            price: product.price,
            quantity,
            total: product.price * quantity,
        }
        cart.items = cart.items.concat(newItem)
        cart.subTotal = cart.subTotal + newItem.price
        await cart.save()
        return cart
    }
    throw new Error('No No')
    /*
    [Old] -> if the product already in cart
    - Do NOT add the product again.
    - get the old item from cart.
    - increment item's [quantity] and [total]
    - re-calculate the cart [subTotal]
    
    TODO: impelement

    */
}

module.exports = {
    Cart,
    fetchUserCartByUserId: fetchOrCreateCartByUserId,
    addProductToCartByUserId,
    fetchProductInCart,
}

/*
exports.addItemToCart = async (req, res) => {
    const {
        productId
    } = req.body;
    const quantity = Number.parseInt(req.body.quantity);
    try {
        let cart = await cartRepository.cart();
        let productDetails = await productRepository.productById(productId);
             if (!productDetails) {
            return res.status(500).json({
                type: "Not Found",
                msg: "Invalid request"
            })
        }
        //--If Cart Exists ----
        if (cart) {
            //---- Check if index exists ----
            const indexFound = cart.items.findIndex(item => item.productId.id == productId);
            //------This removes an item from the the cart if the quantity is set to zero, We can use this method to remove an item from the list  -------
            if (indexFound !== -1 && quantity <= 0) {
                cart.items.splice(indexFound, 1);
                if (cart.items.length == 0) {
                    cart.subTotal = 0;
                } else {
                    cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
                }
            }
            //----------Check if product exist, just add the previous quantity with the new quantity and update the total price-------
            else if (indexFound !== -1) {
                cart.items[indexFound].quantity = cart.items[indexFound].quantity + quantity;
                cart.items[indexFound].total = cart.items[indexFound].quantity * productDetails.price;
                cart.items[indexFound].price = productDetails.price
                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
            }
            //----Check if quantity is greater than 0 then add item to items array ----
            else if (quantity > 0) {
                cart.items.push({
                    productId: productId,
                    quantity: quantity,
                    price: productDetails.price,
                    total: parseInt(productDetails.price * quantity)
                })
                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
            }
            //----If quantity of price is 0 throw the error -------
            else {
                return res.status(400).json({
                    type: "Invalid",
                    msg: "Invalid request"
                })
            }
            let data = await cart.save();
            res.status(200).json({
                type: "success",
                mgs: "Process successful",
                data: data
            })
        }
        //------------ This creates a new cart and then adds the item to the cart that has been created------------
        else {
            const cartData = {
                items: [{
                    productId: productId,
                    quantity: quantity,
                    total: parseInt(productDetails.price * quantity),
                    price: productDetails.price
                }],
                subTotal: parseInt(productDetails.price * quantity)
            }
            cart = await cartRepository.addItem(cartData)
            // let data = await cart.save();
            res.json(cart);
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({
            type: "Invalid",
            msg: "Something went wrong",
            err: err
        })
    }
}
*/
