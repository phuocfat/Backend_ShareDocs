const jwtVariable = require("../../variables/jwt");

const User = require("../../model/userModel");

const authMethod = require("./auth.method");

exports.isAuth = async (req, res, next) => {
  const accessTokenFromHeader = req.headers.x_authorization;

  if (!accessTokenFromHeader) {
    return res.status(401).send("Không tìm thấy access token!");
  }

  const accessTokenSecret =
    process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;

  const verified = await authMethod.verifyToken(
    accessTokenFromHeader,
    accessTokenSecret
  );
  if (!verified) {
    return res
      .status(401)
      .send("Bạn không có quyền truy cập vào tính năng này!");
  }

  const user = await User.findOne(verified.payload.username);
  req.user = user;
  user.password = undefined;
  return next();
};
