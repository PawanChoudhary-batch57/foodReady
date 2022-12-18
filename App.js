const express=require('express')
const mongoose=require('mongoose')
const morgan= require('morgan')
const bodyParser= require('body-parser')
const cookieParser= require('cookie-parser')
const expressValidator= require('express-validator')
const cors=require('cors');
const path=require('path')

require("dotenv").config();




const authRoutes= require('./routes/auth')
const userRoutes= require('./routes/user')
const categoryRoutes= require('./routes/category')
const foodproductRoutes= require('./routes/foodproduct')
const placeRoutes= require('./routes/place')
const braintreeRoutes= require('./routes/braintree')
const orderRoutes= require('./routes/order')

const app=express()
//db
mongoose
  .connect(process.env.DATABASE, {})
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB Error => ", err));

// middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(expressValidator());
app.use(cors());
// routes middleware
app.use('/api',authRoutes);
app.use('/api',userRoutes);
app.use('/api',categoryRoutes);
app.use('/api',foodproductRoutes);
app.use('/api',braintreeRoutes);
app.use('/api',orderRoutes);
app.use('/api',placeRoutes);


app.use(express.static(path.join(__dirname,'../frontend/build')))

app.get('*',function(req,res){
  res.sendFile(path.join(__dirname,'../frontend/build/index.html'))
})


const port=process.env.PORT||8000

app.listen(port,()=>{
    console.log(`Server is running on port${port}`)
});