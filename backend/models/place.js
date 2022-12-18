const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {ObjectId}=mongoose.Schema

const placeModel = new Schema({
    restaurantName: { type: String, required: true },
    rating:{type:Number,required:true},
    restaurantAddress: { type: String, required: true },
    city:{ type: String, required: true },   
    placeImage: { data: Buffer,contentType :String },
    price:  { type: Number, required: true },
    sold:  { type: Number, required: true },
    category : { type: ObjectId,ref: 'Category', required :true},
    
    
    
   
},
{timestamps :true}
);

module.exports = mongoose.model('places',placeModel,'places')