const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/signin", (req, res) => {
  res.render("signinPage");
});
router.get("/signup", (req, res) => {
  res.render("signupPage");
});

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;

  await User.create({
    fullName,
    email,
    password,
  });

  return res.redirect("/");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  // const user = await User.findOne({ email });

  try {
    const token = await User.matchedPasswordAndGenerateToken(email, password);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signinPage", {
      error: "Incorrect Email or Password",
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

module.exports = router;
