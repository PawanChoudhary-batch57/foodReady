const formidable =require("formidable");
const _=require("lodash");
const fs =require("fs")
const Place =require("../models/place");
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

        const { restaurantName, restaurantAddress,  rating,price ,category,sold,city } = fields;

        if (  !price || !category || !restaurantName || !restaurantAddress||!city||!rating||!sold ) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        let place =new Place(fields)
        if (files.placeImage) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.placeImage.size > 1000000) {
              return res.status(400).json({
                error: "Image should be less than 1mb in size",
              });
            }
            place.placeImage.data = fs.readFileSync(files.placeImage.filepath); // change path to filepath
            place.placeImage.contentType = files.placeImage.mimetype; // change typt to mimetype
          }
          place.save((err,result) =>{
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
    let place = req.place;
    place.remove((err, deletedplace) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
           
            message: 'Restaurent deleted successfully'
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
        const { restaurantName, restaurantAddress,  rating,price ,category,sold,city } = fields;

        if ( !price || !category || !restaurantName || !restaurantAddress||!city||!rating||!sold ) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        let place = req.place;
        
        place = _.extend(place, fields);         // used _.extend method from lodash library

        // 1kb = 1000
        // 1mb = 1000000

         if (files.foodImage) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.foodImage.size > 1000000) {
              return res.status(400).json({
                error: "Image should be less than 1mb in size",
              });
            }
            place.placeImage.data = fs.readFileSync(files.placeImage.filepath); // change path to filepath
            place.placeImage.contentType = files.placeImage.mimetype; // change typt to mimetype
          }

        place.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};
exports.placeById = (req, res, next, id) => {
    Place.findById(id)
        .populate('category')
        .exec((err, place) => {
            if (err || !place) {
                return res.status(400).json({
                    error: 'Place not found'
                });
            }
            req.place = place;
            next();
        });
};

exports.read = (req, res) => {
    req.place.placeImage = undefined;
    return res.json(req.place);
};





// exports.menuList=(req,res) =>{
//     let order =req.query.order ? req.query.order: 'asc'
//     let sortBy =req.query.sortBy ? req.query.sortBy : '_id'
//     let limit=req.query.limit ? parseInt(req.query.order): 10
    
//     FoodProduct.find()
//         .select("-foodImage")
//         .populate('category')
//         .sort([[sortBy,order]])
//         .limit(limit)
//         .exec((err,data)=>{
//             if(err){
//                 return res.status(400).json({
//                     error:'Food Product not found'
//                 })
//             }
//             res.json(data);
//         })

// }

// to find same category food


exports.listRelated = (req, res) => {
   
    let limit = req.query.limit ? parseInt(req.query.limit) : 4;

    Place.find({ _id: { $ne: req.place }, category: req.place.category })
        .limit(limit)
        .populate('category', '_id name','city')
        .exec((err, places) => {
            if (err) {
                return res.status(400).json({
                    error: 'Places not found'
                });
            }
            res.json(places);
        });
};
exports.listcategories=(req,res)=>{
    Place.distinct("category",{},(err,categories)=>{
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

    Place.find(findArgs)
        .select('-placeImage')
        .populate('category')
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: 'places not found'
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};
exports.placeImage =(req,res,next)=>{

    if(req.place.placeImage.data){
        res.set('Content-Type',req.place.placeImage.contentType);
        return res.send(req.place.placeImage.data);
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
        Place.find(query, (err, places) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(places);
        }).select('-placeImage');
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
        Place.find(query, (err, places) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(places);
        }).select('-placeImage');
    }

exports.searchByCity = (req, res) => {
   
   const query={};
    // assign search value to query.name
    if (req.query.city && req.query.city != 'All') {
        query.city = req.query.city;
    }    
    Place.find(query,(err,places)=>{
        
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(places);
    }).select('-placeImage');
    
};

exports.cityList=(req,res)=>{
    Place.distinct("city",{},(err,cities)=>{
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

    Place.find(query,"restaurantName",{},(err,restaurants)=>{
        if(err){
            return res.status(400).json({
                error: "categories not found"
            })
        }
        res.json(restaurants);
    })

}
