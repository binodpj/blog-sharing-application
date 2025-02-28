const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { generateToken } = require("../services/authentication");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    profileImageUrl: {
      type: String,
      default: "/images/default.png",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  const salt = randomBytes(16).toString();

  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashedPassword;

  next();
});

userSchema.static(
  "matchedPasswordAndGenerateToken",
  async function (email, password) {
    const user = await this.findOne({ email });

    if (!user) throw new Error("User Not Found");

    const hashedPassword = user.password;
    const salt = user.salt;

    const inputHash = createHmac("sha256", salt).update(password).digest("hex");

    if (inputHash !== hashedPassword) {
      throw new Error("Incorrect Password");
    }

    const token = generateToken(user);
    return token;
  }
);

const User = model("user", userSchema);

module.exports = User;
