const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

//Routes

//Home Route
router.get("/", async (req, res) => {
  try {
    const locals = {
      title: "NodeJS blog",
      description: "Simple blog created with NodeJS, Express and MongoDB",
    };

    let perPage = 6;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage); //boolean

    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/",
    });
  } catch (err) {
    console.log(err);
  }
});

//Individual post
router.get("/post/:id", async (req, res) => {
  try {
    const locals = {
      title: "NodeJS blog",
      description: "Simple blog created with NodeJS, Express and MongoDB",
    };
    let slug = req.params.id;
    const data = await Post.findById({ _id: slug });

    res.render("post", {
      locals,
      data,

      currentRoute: `/post/${slug}`,
    });
  } catch (err) {
    console.log(err);
  }
});

//Search
router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "NodeJS blog",
      description: "Simple blog created with NodeJS, Express and MongoDB",
    };
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, ""); //remove special char
    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });

    res.render("search", { data, locals });
  } catch (err) {
    console.log(err);
  }
});

router.get("/about", (req, res) => {
  res.render("about", { currentRoute: "/about" });
});

module.exports = router;
