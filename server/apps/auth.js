import { Router } from "express";
import { db } from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authRouter = Router();

// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้
authRouter.post("/register", async (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  };

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  const collection = db.collection("users");
  try {
    await collection.insertOne(user);
  } catch {
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
  return res.status(201).json({
    message: "User has been created.",
  });
});
// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้
authRouter.post("/login", async (req, res) => {
  let user;
  let isValidPassword;
  try {
    user = await db.collection("users").findOne({
      username: req.body.username
    });
    isValidPassword = await bcrypt.compare(req.body.password, user.password);
  } catch {
    return res.status(500).json({
      message: "Internal server error!",
    });
  }
  if (!user) {
    return res.status(404).json({
      message: "User not found.",
    });
  }

  if (!isValidPassword) {
    return res.status(401).json({
      message: "Password not valid.",
    });
  }

  const token = jwt.sign(
    {
        id: user._id,
        firstname: user.firstname,
        firstname: user.lastname,
    },
    process.env.SECRET_KEY,
    {
        expiresIn: '900000'
    }
  )

  return res.status(200).json({
    "message": "login successfully",
    "token": token
  })
});
export default authRouter;
