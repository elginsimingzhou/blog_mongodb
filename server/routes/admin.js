const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

//Check login

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

//Admin login page
router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple blog created with NodeJS, Express and MongoDB",
    };

    res.render("admin/index", {
      locals,
      layout: adminLayout,
    });
  } catch (err) {
    console.log(err);
  }
});

//POST Admin - Check login

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });

    res.redirect("/dashboard");

    // res.render("admin/index", {
    //   locals,
    //   layout: adminLayout,
    // });
  } catch (err) {
    console.log(err);
  }
});

//POST Admin - Dashboard *Protected by authMiddleware

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple blog created with NodeJS, Express and MongoDB",
    };

    const data = await Post.find();

    res.render("admin/dashboard", { locals, data, layout: adminLayout });
  } catch (err) {
    console.log(err);
  }
});

// GET : Admin create new post

router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple blog created with NodeJS, Express and MongoDB",
    };

    res.render("admin/add-post", { locals, layout: adminLayout });
  } catch (err) {
    console.log(err);
  }
});

// POST : Admin create new post

router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    // console.log(req.body)
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
      });

      await Post.create(newPost);
      res.redirect("/dashboard");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});

// GET : Admin edit post

router.get("/edit-post/:_id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Edit Post",
      description: "Simple blog created with NodeJS, Express and MongoDB",
    };

    // console.log(req.params)
    const _id = req.params._id;
    const data = await Post.findById({ _id: _id });

    res.render("admin/edit-post", { locals, data, layout: adminLayout });
  } catch (err) {
    console.log(err);
  }
});

// PUT : Admin edit post

router.put("/edit-post/:_id", authMiddleware, async (req, res) => {
  try {
    // console.log(req.params)
    try {
      // console.log(req.params)
      // console.log(req.body)

      await Post.findByIdAndUpdate(req.params._id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now(),
      });
      res.redirect(`/edit-post/${req.params._id}`);
      // res.redirect('/dashboard')
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});

// DELETE : Admin delete post

router.delete("/delete-post/:_id", authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params._id });
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }
});

router.get('/logout', authMiddleware, async(req,res) => {
  res.clearCookie('token');
  // res.json({message: "Logout successful"});
  res.redirect('/');
})

//POST Admin - Register

// router.post("/register", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     try {
//       const user = await User.create({
//         username,
//         password: hashedPassword,
//       });
//       res.status(201).json({ message: "User Created", user });
//     } catch (error) {
//       if (error.code === 11000) {
//         res.status(409).json({ message: "User already in use" });
//       }
//       res.status(500).json({ message: "Internal server error" });
//     }

//   } catch (err) {
//     console.log(err);
//   }
// });

module.exports = router;
