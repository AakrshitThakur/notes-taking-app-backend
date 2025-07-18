import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  if (
    !req.body ||
    !req.body.username ||
    !req.body.email ||
    !req.body.password
  ) {
    return res
      .status(400)
      .json({ msg: "Please provide all the credentials", status: 400 });
  }
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user)
      return res.status(400).json({ msg: "User already exists", status: 400 });

    user = new User({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    console.log(await user.save());

    const payload = {
      user_id: user._id,
      user_email: user.email,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "notes-taking-app-backend",
      {
        expiresIn: "6h",
      }
    );
    res
      .status(200)
      .cookie("jwt", token, {
        expires: new Date(Date.now() + 6 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .json({
        user_id: user._id,
        msg: "User successfully created",
        status: 200,
      });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: error.message, status: 500 });
  }
});

// Login
router.post("/login", async (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ msg: "Please provide all the credentials", status: 400 });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "Invalid credentials", status: 400 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const payload = {
      user_id: user._id,
      user_email: user.email,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "mern-auth-backend",
      {
        expiresIn: "6h",
      }
    );
    res
      .status(200)
      .cookie("jwt", token, {
        expires: new Date(Date.now() + 6 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .json({
        user_id: user._id,
        msg: "User successfully logged in",
        status: 200,
      });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: error.message });
  }
});

router.post("/logout", (req, res) => {
  res
    .clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .status(200)
    .json({ msg: "Logged out successfully", status: 200 });
});

export default router;
