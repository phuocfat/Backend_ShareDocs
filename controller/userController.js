const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const randToken = require("rand-token");

const User = require("../model/userModel");
const authMethod = require("./auth/auth.method");
const jwtVariable = require("../variables/jwt");
const { SALT_ROUNDS } = require("../variables/auth");
const { findByIdAndUpdate } = require("../model/userModel");
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

    const handlePassword = await bcrypt.hash(password, SALT_ROUNDS);

    let refreshToken = await randToken.generate(jwtVariable.refreshTokenSize);

    const user = await User.create({
      username,
      email,
      password: handlePassword,
      refreshToken: refreshToken,
    });

    user.password = undefined;

    const accessToken = await jwt.sign(user.toJSON(), process.env.PRIVATE_KEY, {
      expiresIn: process.env.TIMEOFEXSITENCE,
    });

    return res.json({
      status: true,
      msg: "Tạo tài khoản thành công",
      accessToken,
    });
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
    console.log(checkPassword);
    if (!checkPassword)
      return res.json({ msg: "Tài khoản hoặc mật khẩu đã sai" });

    user.password = undefined;

    const dataForAccessToken = { status: true, user };
    const accessTokenLife =
      process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;
    const accessTokenSecret =
      process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;

    const accessToken = await authMethod.generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    );

    if (!accessToken) {
      return res
        .status(401)
        .send("Đăng nhập không thành công, vui lòng thử lại.");
    }

    let refreshToken = randToken.generate(jwtVariable.refreshTokenSize); // tạo 1 refresh token ngẫu nhiên

    if (!user.refreshToken) {
      await User.findOneAndUpdate(user.username, {
        refreshToken: refreshToken,
      });
    } else {
      refreshToken = user.refreshToken;
    }

    return res.json({
      status: true,
      msg: "Đăng nhập thành công.",
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    next(err);
  }
};
