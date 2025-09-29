var express = require("express");
const {
  addProduct,
  updateProduct,
  viewProducts,
  viewSingleProduct,
  viewOutOfStockProducts,
  getcategories,
  addProductToWishlist,
  viewWishlist,
  removeFromWishlist,
  viewAllProductsForUsers,
  addToCart,
  removeFromCart,
  viewCart,
  updateProductQuantity,
} = require("../controllers/product");
const auth = require("../middleware/auth");
// const { viewDeletedUser } = require('../controllers/admin');
const {uploadStorage} = require("../commonModule/commonFuntion")
const authentication = require("../middleware/authenticate");
var router = express.Router();


router.post("/add-product", auth, uploadStorage.single("image"), addProduct);

router.put('/update-product/:id' , auth,uploadStorage.single("image"), updateProduct)


// router.post('/add-product',auth, addProduct)

router.put("/update-product/:id", auth, updateProduct);

router.get("/view-products", auth, viewProducts);

router.get("/view-single-product/:id",authentication, viewSingleProduct);

router.get("/view-outof-stock", auth, viewOutOfStockProducts);

router.get('/view-all-user-products',authentication, viewAllProductsForUsers)

router.get("/get-categories", getcategories);

//wishlist routes
router.post("/add-to-wishlist", auth, addProductToWishlist);

router.get("/view-wishlist", auth, viewWishlist);

router.put("/remove-from-wishlist",auth, removeFromWishlist);

router.post("/add-to-cart", auth , addToCart);

router.put('/remove-from-cart', auth, removeFromCart);

router.get("/view-cart",auth, viewCart)

router.patch('/update-quantity', auth, updateProductQuantity)

module.exports = router;
