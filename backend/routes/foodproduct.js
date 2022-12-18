const express = require("express");
const router = express.Router();

const { create, foodproductById,read ,remove,update, menuList , 
    listRelated, listcategories, listBySearch,cityList,restaurentList,searchByCity ,foodImage,listSearch,
    listSearchByRestaurent}= require("../controllers/foodproduct");
const { requireSignin, isAuth, isAdmin }=require("../controllers/auth");
const { userById }=require("../controllers/user");

router.post('/foodproduct/create/:userId',requireSignin, isAuth , isAdmin, create);
router.get("/foodproduct/:foodproductId",read);
router.delete('/foodproduct/:foodproductId/:userId',requireSignin, isAuth , isAdmin, remove);
router.put('/foodproduct/:foodproductId/:userId',requireSignin, isAuth , isAdmin, update);
router.get('/foodproducts/',menuList)
router.get('/foodproducts/cityList',cityList)
router.get('/foodproducts/restaurentList/',restaurentList)
router.get('/foodproducts/search',listSearch)
router.get("/foodproducts/related/:foodproductId",listRelated)
router.get("/foodproducts/categories",listcategories)
router.post("/foodproducts/by/search", listBySearch)
router.get("/foodproduct/foodImage/:foodproductId",foodImage)
router.get('/foodproducts/searchByCity',searchByCity)
router.get('/foodproducts/searchByCity',searchByCity)
router.get('/foodproducts/listSearchByRestaurent/',listSearchByRestaurent)




router.param('userId',userById);
router.param("foodproductId",foodproductById);
module.exports =router;