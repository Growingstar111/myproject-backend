const { default: mongoose } = require("mongoose");
const { Category } = require("../models/category");
const { products } = require("../models/product");
const { users } = require("../models/userSchema");
const wishlist = require("../models/wishlist");
const { cart } = require("../models/cart");

// api for add-products
async function addProduct(req, res) {
  try {
    const { name, brand, categoryId, features, description, price, stock } =
      req.body;
    const image = req.file.path ? req.file.path : null;

    const category = await Category.find({ _id: categoryId });
    console.log(">>>>>>>>>", categoryId);

    if (!category) {
      return res.status(400).json({
        statusCode: 400,
        message: "Category not found",
      });
    }
    const companyId = req.userId;
    const existingProduct = await products.findOne({
      name: name,
      brand: brand,
      category: categoryId,
      features: features,
      price: price,
    });
    console.log(existingProduct);

    if (existingProduct) {
      existingProduct.stock += Number(stock);

      await existingProduct.save();
      return res.status(200).json({
        statusCode: 200,
        message: "Product Stock is Updated Succesfully",
        data: existingProduct,
      });
    } else {
      const newProduct = await products.create({
        name,
        image: image,
        description,
        category: categoryId,
        features,
        price,
        stock,
        brand,
        createdBy: companyId,
      });
      const saveProduct = await newProduct.save();
      return res.status(200).json({
        statusCode: 200,
        message: "Product is added Successfully...",
        data: saveProduct,
      });
    }
  } catch (error) {
    console.log("error----", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// api for update product
async function updateProduct(req, res) {
  try {
    const userId = req.userId;
    const productId = req.params.id;
    const updateData = req.body;

    //  user exists
    const userExists = await users.findById(userId);
    if (!userExists) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "User  not found" });
    }

    // product exists
    const productExists = await products.findById(productId);
    if (!productExists) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Product not found" });
    }

    //  update the product
    const updatedProduct = await products.findByIdAndUpdate(
      productId,
      updateData,
      {
        new: true,
      }
    );

    return res.status(200).json({
      statusCode: 200,
      message: "Product is updated Succesfully",
      updatedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ statusCode: 500, message: "Server error" });
  }
}

//api for viewing all the products that company added
async function viewProducts(req, res) {
  try {
    const findProduct = await products.aggregate([
      // {
      //   $lookup: {
      //     from: "categories",
      //     let: { categoryId: "$category" },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $eq: ["$_id", "$$categoryId"],
      //           },
      //         },
      //       },
      //     ],
      //     as: "categoryInfo",
      //   },
      // },

      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(req.userId),
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },

      {
        $unwind: {
          path: "$categoryInfo",
        },
      },

      // {
      //   $project:{
      //     category:1
      //   }
      // },
    ]);
    // {
    //   createdBy: req.userId,
    // });
    if (!findProduct) {
      return res.status(404).json({
        statusCode: 404,
        message: "Product Not Found",
      });
    }

    console.log(">>>>>>>>>>>>>>>>");

    return res.status(200).json({
      statusCode: 200,
      message: "Productes Found successfully!!!",
      data: findProduct,
    });
  } catch (error) {
    console.log("error---", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Server Error",
    });
  }
}

//api for viewing single product
async function viewSingleProduct(req, res) {
  try {
    const userId = req.userId ? req.userId : null;
    const { id } = req.params;
   
    
    const findProduct = await products.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categorys",
        },
      },
      {
        $unwind: {
          path: "$categorys",
        },
      },
      {
        $lookup: {
          from: "wishlists",
          let: {
            productId: "$_id",
            userId: new mongoose.Types.ObjectId(userId),
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$productId", "$$productId"] },
                    { $eq: ["$createdBy", "$$userId"] },
                  ],
                },
              },
            },
          ],
          as: "isWishlist",
        },
      },
      {
        $lookup:{
          from:"users",
          let:{createdBy:"$createdBy"},
          pipeline:[
            {
              $match:{
                $expr:{
                  $eq:["$_id", "$$createdBy"]
                }
              }
            }
          ],
          as:"company"
        }
      },
      {
      $unwind:{
        path:"$company"
      }
      },
      {
        $project: {
          name: 1,
          stock: 1,
          brand: 1,
          price: 1,
          description: 1,
          features: 1,
          category: "$categoryInfo.category",
          image: 1,
          isWishlist: { $anyElementTrue: ["$isWishlist"] },
          createdBy:1,
          company:"$company.accountId"
        },
      },
     
    ]);

    const viewProduct = findProduct;

    return res.status(200).json({
      statusCode: 200,
      message: "Product found successfully",
      data: viewProduct,
    });
  } catch (error) {
    console.log("error---", error);
    res.status(500).json({
      statusCode: 500,
      message: "Server Error",
    });
  }
}

// api for viewing out of stock products
async function viewOutOfStockProducts(req, res) {
  const findProducts = await products.aggregate([
    {
      $match: { createdBy: new mongoose.Types.ObjectId(req.userId), stock: 0 },
    },
  ]);

  if (findProducts.length == 0) {
    return res.status(400).json({
      message: "there is no product with zero quantity",
      statusCode: 400,
    });
  } else if (findProducts.length > 0) {
    return res.status(200).json({
      message: "here is your products whose stock is zero",
      data: findProducts,
    });
  }
}

//api for getting categories
async function getcategories(req, res) {
  try {
    const category = await Category.find();
    if (!category) {
      return res.status(400).json({
        message: "Category Not found",
        statusCode: 400,
      });
    }
    return res.status(200).json({
      message: "Category FOund Succesfully",
      statusCode: 200,
      data: category,
    });
  } catch (error) {
    console.log("error----", error);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
}

async function viewAllProductsForUsers(req, res) {
  const userId = req.userId ? req.userId : null;
  let pageNo = req.query.page || 1;
  let pageLimit = req.query.pageLimit || 10;
  let searchQuery = {};
  if (req.query.search) {
    searchValue = {
      $regex: req.query.search,
      $options: "i",
    };
    searchQuery = {
      $or: [
        { name: searchValue },
        { brand: searchValue },
        { description: searchValue },
        { category: searchValue },
        { features: searchValue },
      ],
    };
  }

  if (req.query.minPrice || req.query.maxPrice) {
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Infinity;

    searchQuery.price = {
      $gte: minPrice,
      $lte: maxPrice,
    };
  }

  try {
    const findProducts = await products.aggregate([
      // {$match:{
      //   stock:{$gt :0}
      // }},
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },

      {
        $unwind: {
          path: "$categoryInfo",
        },
      },

      {
        $lookup: {
          from: "wishlists",
          let: {
            userId: new mongoose.Types.ObjectId(userId),
            productId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$productId", "$productId"] },
                    { $eq: ["$createdBy", "$$userId"] },
                  ],
                },
              },
            },
          ],
          as: "wishItem",
        },
      },
      {
        $lookup:{
          from:"users",
          let:{createdBy:"$createdBy"},
          pipeline:[
            {
              $match:{
                $expr:{
                  $eq:["$_id", "$$createdBy"]
                }
              }
            }
          ],
          as:"company"
        }
      },
      {
        $unwind:{
          path:"$company"
        }
      },
      {
        $project: {
          name: 1,
          stock: 1,
          brand: 1,
          price: 1,
          description: 1,
          features: 1,
          category: "$categoryInfo.category",
          image: 1,
          wishItem: { $anyElementTrue: ["$wishItem"] },
          createdBy:1,
          company:"$company.accountId"
        },
      },
      { $match: searchQuery },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $facet: {
          data: [{ $skip: pageLimit * (pageNo - 1) }, { $limit: pageLimit }],
          count: [{ $count: "count" }],
        },
      },
    ]);
    if (!findProducts) {
      return res.status(400).json({
        statusCode: 400,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: "Products found successfully",
      totalCount: findProducts[0]?.count[0]?.count,
      data: findProducts[0]?.data,
    });
  } catch (error) {
    console.log("error----", error);
    return res.status(500).json({
      statusCode: 500,
      message:
        "An error occurred while removing the product from your Wishlist",
    });
  }
}

//api for wishlisting product
async function addProductToWishlist(req, res) {
  const userId = req.userId;
  const { productId } = req.body;

  console.log(productId);

  try {
    const existingWishlistItem = await wishlist.findOne({
      productId: productId,
      createdBy: userId,
    });

    console.log("Existing Wishlist Item:", existingWishlistItem);

    if (existingWishlistItem) {
      return res.status(200).json({
        statusCode: 400,
        message: "Product is already in your Wishlist",
      });
    }

    const newWishlistItem = await wishlist.create({
      createdBy: userId,
      productId: productId,
    });

    res.status(201).json({
      statusCode: 201,
      message: "Product added to your Wishlist",
      data: newWishlistItem,
    });
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "An error occurred while adding the product to your Wishlist",
    });
  }
}

//api for seeing wishlist
async function viewWishlist(req, res) {
  const userId = req.userId;

  const findWishlistItem = await wishlist.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "products",
        let: { product: "$productId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$product"],
              },
            },
          },
        ],
        as: "wishlistItem",
      },
    },
    {
      $unwind: {
        path: "$wishlistItem",
      },
    },
    {
      $project: {
        wishlistItem: 1,
      },
    },
  ]);

  if (!findWishlistItem) {
    return res.status(400).json({
      statusCode: 400,
      message: "there is no product in your wishlist",
    });
  }
  return res.status(200).json({
    statusCode: 200,
    message: "Wishlist products found successfuly",
    data: findWishlistItem,
  });
}

//api for removing product from wishlist
async function removeFromWishlist(req, res) {
  try {
    const userId = req.userId;

    const { productId } = req.body;

    console.log(productId);
    console.log("req.body...........", req.body);
    if (!productId) {
      return res.status(400).json({
        statuCode: 400,
        message: "please Provide Product Id",
      });
    }
    const findProduct = await wishlist.findOne({
      createdBy: userId,
      productId: productId,
    });

    if (!findProduct) {
      return res.status(400).json({
        statuCode: "400",
        message: "Product is not found in wishlist",
      });
    }

    const removeProduct = await wishlist.deleteOne({
      createdBy: userId,
      productId: productId,
    });
    return res.status(200).json({
      statusCode: 200,
      message: "Product is removed from Your wishlist successfully.",
      data: removeProduct,
    });
  } catch (error) {
    console.log("error----", error);
    return res.status(500).json({
      statuCode: 500,
      message:
        "An error occurred while removing the product from your Wishlist",
    });
  }
}

//api for add to cart
async function addToCart(req, res) {
  try {
    const { productId } = req.body;

    const findProduct = await cart.findOne({
      productId: productId,
      createdBy: req.userId,
    });

    if (findProduct) {
      return res.status(200).json({
        statusCode: 400,
        message: "PRoduct is already in cart",
      });
    }
    const newProduct = await cart.create({
      productId: productId,
      createdBy: req.userId,
    });

    await newProduct.save();
    return res.status(200).json({
      statusCode: 200,
      message: "Product is Successfully added to the cart.",
      data: newProduct,
    });
  } catch (error) {
    console.log("error----", error);
    return res.status(500).json({
      statuCode: 500,
      message: "Internal Server Error",
    });
  }
}

//api to remove from cart
async function removeFromCart(req, res) {
  try {
    const { productId } = req.body;

    const findProduct = await cart.findOne({
      productId: productId,
      createdBy: req.userId,
    });

    if (!findProduct) {
      return res.status(200).json({
        statusCode: 400,
        message: "Product not found in the cart ",
      });
    }

    await cart.deleteOne({
      createdBy: req.userId,
      productId: productId,
    });

    return res.status(200).json({
      statusCode: 200,
      message: "Product is successfully removed from cart",
      data: findProduct,
    });
  } catch (error) {
    console.log("error----", error);
    return res.status(500).json({
      message: "Internal server error",
      statusCode: 500,
    });
  }
}
//api for view cart
async function viewCart(req, res) {
  const findProducts = await cart.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(req.userId),
      },
    },

    {
      $lookup: {
        from: "products",
        let: { product: "$productId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$product"],
              },
            },
          },
        ],
        as: "products",
      },
    },
    {
      $unwind: {
        path: "$products",
      },
    },
   
    {
      $lookup: {
        from: "users",
        let: { createdBy: "$products.createdBy" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$createdBy"],
              },
            },
          },
          {
            $project: {
              _id:0,
              accountId: 1,
            },
          },
        ],
        as: "company",
      },
    },
    {
      $unwind:{
        path:"$company"
      }
    },
  

   
    {
      $project:{
        _id:1,
        createdBy:1,
        productId:1,
        quantity:1,
        products:1,
        company:"$company.accountId"
      }
    }
  ]);

  if (!findProducts) {
    return res.status(200).json({
      statusCode: 400,
      message: "Your cart is empty.",
    });
  }
  if (findProducts.length == 0) {
    return res.status(200).json({
      statusCode: 400,
      message: "Your cart is empty.",
    });
  }

  return res.status(200).json({
    message: "Cart Product finded successfully...",
    statusCode: 200,
    data: findProducts,
  });
}

async function updateProductQuantity(req, res) {
  const { productId, quantity } = req.body;
  const userId = req.userId;
  if (!productId || !quantity) {
    return res.status(400).json({
      statusCode: 400,
      message: "Product ID and quantity are required",
    });
  }
  if (quantity <= 0) {
    return res.status(400).json({
      statusCode: 400,
      message: "Quantity must be greater than zero",
    });
  }

  try {
    const findProduct = await cart.findOne({
      productId: productId,
      createdBy: userId,
    });
    if (!findProduct) {
      return res.status(200).json({
        statusCode: 400,
        message: "Product not found in cart",
      });
    }
    const updateQuantity = await cart.updateOne(
      { productId: productId, createdBy: userId },
      { $set: { quantity: quantity } }
    );
    return res.status(200).json({
      statusCode: 200,
      message: "products quantity is updated successfully",
      updateQuantity,
    });
  } catch (error) {
    console.log("error--", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Somthing wnet Wrong",
    });
  }
}

module.exports = {
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
};
