const express = require("express");
const router = express.Router();

const { create, placeById,read ,remove,update, 
    listRelated, listcategories, listBySearch,cityList,restaurentList,searchByCity ,placeImage,listSearch,
    listSearchByRestaurent}= require("../controllers/place");
const { requireSignin, isAuth, isAdmin }=require("../controllers/auth");
const { userById }=require("../controllers/user");

router.post('/place/create/:userId',requireSignin, isAuth , isAdmin, create);
router.get("/place/:placeId",read);
router.delete('/place/:placeId/:userId',requireSignin, isAuth , isAdmin, remove);
router.put('/place/:placeId/:userId',requireSignin, isAuth , isAdmin, update);

router.get('/places/cityList',cityList)
router.get('/places/restaurentList/',restaurentList)
router.get('/places/search',listSearch)
router.get("/place/listRelated/:placeId",listRelated)
router.get("/places/categories",listcategories)
router.post("/places/by/search", listBySearch)
router.get("/place/placeImage/:placeId",placeImage)
router.get('/places/searchByCity',searchByCity)
router.get('/places/searchByCity',searchByCity)
router.get('/places/listSearchByRestaurent/',listSearchByRestaurent)




router.param('userId',userById);
router.param("placeId",placeById);
module.exports =router;