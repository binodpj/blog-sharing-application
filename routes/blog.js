const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/add-blog", (req, res) => {
  res.render("addBlog", {
    user: req.user,
  });
});

router.post("/add-blog", upload.single("coverImage"), async (req, res) => {
  //   console.log(req.body);
  const { title, body } = req.body;

  const blog = await Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImageUrl: `/uploads/${req.file.filename}`,
  });

  return res.redirect(`${blog._id}`);
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );
  console.log(blog);
  return res.render("blogPage", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/:blogId/delete", async (req, res) => {
  const blog = await Blog.findOneAndDelete(req.params.blogId);
  return res.status(200).redirect("/");
});

router.post("/:blogId/update", async (req, res) => {
  const blog = await Blog.findOneAndUpdate(req.params.blogId);
  return res.status(200).redirect("/");
});

router.post("/:blogId/comment", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

module.exports = router;
