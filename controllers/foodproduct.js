
const formidable =require("formidable");
const _=require("lodash");
const fs =require("fs")
const FoodProduct =require("../models/foodproduct");
const { errorHandler } = require("../helpers/dbErrorHandler");





exports.create =(req,res) => {
    let form= new formidable.IncomingForm()
    form.keepExtensions= true
    form.parse(req,(err,fields,files)=>{
        if(err){
            return res.status(400).json({
                error :' image couldnot be uploaded'
            })

        }
        //check for allfields

        const { restaurantName, restaurantAddress, name, description, price ,category,sold,city } = fields;

        if (!name || !description || !price || !category || !restaurantName || !restaurantAddress||!city ) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        let foodproduct =new FoodProduct(fields)
        if (files.foodImage) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.foodImage.size > 1000000) {
              return res.status(400).json({
                error: "Image should be less than 1mb in size",
              });
            }
            foodproduct.foodImage.data = fs.readFileSync(files.foodImage.filepath); // change path to filepath
            foodproduct.foodImage.contentType = files.foodImage.mimetype; // change typt to mimetype
          }
          foodproduct.save((err,result) =>{
            if (err) {
                console.log('PRODUCT CREATE ERROR ', err);
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);


          });
    });
 };
 exports.remove = (req, res) => {
    let foodproduct = req.foodproduct;
    foodproduct.remove((err, deletedFoodProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
           
            message: 'Product deleted successfully'
        });
    });
};
exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }
        const { restaurantName, restaurantAddress, name, description, foodImage, price ,category,city } = fields;

        if (!name || !description || !price || !category || !restaurantName || !restaurantAddress||!city ) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        let foodproduct = req.foodproduct;
        
        foodproduct = _.extend(foodproduct, fields);         // used _.extend method from lodash library

        // 1kb = 1000
        // 1mb = 1000000

         if (files.foodImage) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.foodImage.size > 1000000) {
              return res.status(400).json({
                error: "Image should be less than 1mb in size",
              });
            }
            foodproduct.foodImage.data = fs.readFileSync(files.foodImage.filepath); // change path to filepath
            foodproduct.foodImage.contentType = files.foodImage.mimetype; // change typt to mimetype
          }

        foodproduct.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};
exports.foodproductById = (req, res, next, id) => {
    FoodProduct.findById(id)
        .populate('category')
        .exec((err, foodproduct) => {
            if (err || !foodproduct) {
                return res.status(400).json({
                    error: 'Product not found'
                });
            }
            req.foodproduct = foodproduct;
            next();
        });
};

exports.read = (req, res) => {
    req.foodproduct.foodImage = undefined;
    return res.json(req.foodproduct);
};





exports.menuList=(req,res) =>{
    let order =req.query.order ? req.query.order: 'asc'
    let sortBy =req.query.sortBy ? req.query.sortBy : '_id'
    let limit=req.query.limit ? parseInt(req.query.order): 10
    
    FoodProduct.find()
        .select("-foodImage")
        .populate('category')
        .sort([[sortBy,order]])
        .limit(limit)
        .exec((err,data)=>{
            if(err){
                return res.status(400).json({
                    error:'Food Product not found'
                })
            }
            res.json(data);
        })

}

// to find same category food


exports.listRelated = (req, res) => {
   
    let limit = req.query.limit ? parseInt(req.query.limit) : 4;

    FoodProduct.find({ _id: { $ne: req.foodproduct }, category: req.foodproduct.category })
        .limit(limit)
        .populate('category', '_id name')
        .exec((err, foodproducts) => {
            if (err) {
                return res.status(400).json({
                    error: 'Products not found'
                });
            }   
            res.json(foodproducts);
        });
};
exports.listcategories=(req,res)=>{
    FoodProduct.distinct("category",{},(err,categories)=>{
        if(err){
            return res.status(400).json({
                error: "categories not found"
            })
        }
        res.json(categories);
    })
}
exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : 'desc';
    let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};


    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === 'price') {
            
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    FoodProduct.find(findArgs)
        .select('-foodImage')
        .populate('category')
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: 'food Products not found'
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};
exports.foodImage =(req,res,next)=>{

    if(req.foodproduct.foodImage.data){
        res.set('Content-Type',req.foodproduct.foodImage.contentType);
        return res.send(req.foodproduct.foodImage.data);
    }
    next();
};
exports.listSearch = (req, res) => {
    // create query object to hold search value and category value
    const query = {};
    // assign search value to query.name
    if (req.query.search) {
        query.name = { $regex: req.query.search, $options: 'i' };
        // assigne category value to query.category
        if (req.query.category && req.query.category != 'All') {
            query.category = req.query.category;
        }
        // find the product based on query object with 2 properties
        // search and category
        FoodProduct.find(query, (err, foodproducts) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(foodproducts);
        }).select('-foodImage');
    }
};
exports.listSearchByRestaurent = (req, res) => {
    // create query object to hold search value and category value
    const query = {};
    // assign search value to query.name
   
        // assigne category value to query.category
        if (req.query.restaurantName ) {
            query.restaurantName = req.query.restaurantName;
        }
        // find the product based on query object with 2 properties
        // search and category
        FoodProduct.find(query, (err, foodproducts) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(foodproducts);
        }).select('-foodImage');
    }

exports.searchByCity = (req, res) => {
   
   const query={};
    // assign search value to query.name
    if (req.query.city && req.query.city != 'All') {
        query.city = req.query.city;
    }    
    FoodProduct.find(query,(err,foodproducts)=>{
        
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(foodproducts);
    }).select('-foodImage');
    
};

exports.cityList=(req,res)=>{
    FoodProduct.distinct("city",{},(err,cities)=>{
        if(err){
            return res.status(400).json({
                error: "cities not found"
            })
        }
        res.json(cities);
    })

}
exports.restaurentList=(req,res)=>{
    const query=req.query;

    FoodProduct.find(query,"restaurantName",{},(err,restaurants)=>{
        if(err){
            return res.status(400).json({
                error: "categories not found"
            })
        }
        res.json(restaurants);
    })

}
