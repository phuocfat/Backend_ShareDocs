const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { SALT_ROUNDS } = require("../variables/auth");
dotenv.config();
module.exports.sendLink = async (req, res, next) => {
  const { username, email } = req.body;
  const user = await User.findOne({ username, email });

  if (!user) {
    return res.json({
      status: false,
      msg: "Tên người dùng và email không hợp lệ",
    });
  }
  user.password = undefined;
  const token = await jwt.sign(user.toJSON(), process.env.PRIVATE_KEY, {
    expiresIn: "5m",
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "phuocst24@gmail.com",
      pass: "sqytciugmrbfwnln",
    },
  });

  let link = `http://localhost:3000/reset-password/${user._id}/${token} `;
  var mailOptions = {
    from: process.env.USER_MAIL,
    to: email,
    subject: "Sending link to reset password",
    html: '<p>Click <a href="' + link + '">here</a> to reset your password</p>',
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      return res.json({ status: true });
    }
  });
};

module.exports.connectRestPassword = async (req, res, next) => {
  const { id, token } = req.params;
  try {
    const payload = await jwt.verify(
      token,
      process.env.PRIVATE_KEY,
      function (err, decoded) {
        if (err) {
          return res.json({ status: false, msg: "Token hết hạn" });
        }
        return decoded;
      }
    );

    if (!payload) {
      return res.json({ status: false, msg: "Lỗi máy chủ!" });
    }
    if (id !== payload._id) {
      res.json({ status: false });
    }

    return res.json({
      status: true,
      email: payload.email,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
module.exports.resetPassWord = async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const { id } = req.params;
  if (password !== confirmPassword)
    res.json({
      status: false,
      msg: "Mật khẩu và mật khẩu xác nhận không hợp lệ",
    });
  const handlePassword = await bcrypt.hash(password, SALT_ROUNDS);
  console.log("password", password);
  if (password === confirmPassword) {
    const user = await User.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        password: handlePassword,
      }
    );
    if (user) {
      return res.json({ status: true, msg: "Cập nhập mật khẩu thành công" });
    } else {
      return res.json({ status: false, msg: "Lỗi cập nhật" });
    }
  }
};
