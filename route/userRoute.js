const express = require("express");
const router = express.Router();
const { register, login } = require("../controller/userController");
const authController = require("../controller/auth/auth.controllers");
const {
  sendLink,
  connectRestPassword,
  resetPassWord,
} = require("../controller/forgotpassword");
const refreshToken = authController.refreshToken;
router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword", sendLink);
router.get("/reset-password/:id/:token", connectRestPassword);
router.post("/reset-password/:id/:token", resetPassWord);
router.post("/refresh", refreshToken);
module.exports = router;
