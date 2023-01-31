const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const dotenv = require("dotenv");
dotenv.config();
module.exports.register = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    const checkUser = await User.findOne({ username });
    if (!!checkUser)
      return res.json({ msg: "Tài khoản đã tồn tại", status: false });
    const checkEmail = await User.findOne({ email });
    if (!!checkEmail)
      return res.json({ msg: "Email đã được sử dụng", status: false });

    const Salt = Number(process.env.SALT);
    const handlePassword = await bcrypt.hash(password, Salt);
    const user = await User.create({
      username,
      email,
      password: handlePassword,
    });
    user.password = undefined;
    const valueReturn = { status: true, user };
    const token = await jwt.sign(valueReturn, process.env.PRIVATE_KEY, {
      expiresIn: process.env.TIMEOFEXSITENCE,
    });
    return res.json(token);
  } catch (err) {
    console.log(err);
    next(err);
  }
};
module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.json({ msg: "Tài khoản hoặc mật khẩu đã sai" });

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword)
      return res.json({ msg: "Tài khoản hoặc mật khẩu đã sai" });

    user.password = undefined;

    const valueReturn = { status: true, user };
    const token = await jwt.sign(valueReturn, process.env.PRIVATE_KEY, {
      expiresIn: process.env.TIMEOFEXSITENCE,
    });
    return res.json(token);
  } catch (err) {
    next(err);
  }
};
