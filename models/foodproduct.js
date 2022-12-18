const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {ObjectId}=mongoose.Schema

const foodModel = new Schema({
    name: { type: String, required: true },
    restaurantName: { type: String, required: true },
    restaurantAddress: { type: String, required: true },
    description: { type: String, required: true },
    foodImage: { data: Buffer,contentType :String },
    price:  { type: Number, required: true },
    category : { type: ObjectId,ref: 'Category', required :true},
    sold:{type:Number,required:false},
    city:{ type: String, required: true }
},
{timestamps :true}
);

module.exports = mongoose.model('foodProducts',foodModel,'foodProducts')