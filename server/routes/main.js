const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

//Routes

//Home Route
router.get("/",async (req, res) => {

  try {
  const locals = {
    title: "NodeJS blog",
    description: "Simple blog created with NodeJS, Express and MongoDB",
  };

  let perPage = 6;
  let page = req.query.page || 1;

  const data = await Post.aggregate([{$sort: {createdAt: -1}}])
  .skip(perPage * page - perPage)
  .limit(perPage)
  .exec();

  const count = await Post.countDocuments();
  const nextPage = parseInt(page) + 1;
  const hasNextPage = nextPage <= Math.ceil(count / perPage); //boolean


  res.render("index", {locals, data, current: page, nextPage: hasNextPage? nextPage : null});
  } catch(err){
    console.log(err);
  }


});



router.get("/about", (req, res) => {
  res.render("about");
});

module.exports = router;



