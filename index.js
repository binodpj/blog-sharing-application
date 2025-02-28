const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejs = require("ejs");
const cookieParser = require("cookie-parser");
const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const checkForAuthenticationCookie = require("./middlewares/authentication");

const app = express();
const PORT = 8000;

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

mongoose
  .connect("mongodb://127.0.0.1:27017/blogify")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(`Error: ${err}`));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));
