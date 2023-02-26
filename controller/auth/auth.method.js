const jwt = require("jsonwebtoken");
const pronmisify = require("util").promisify;

const sign = pronmisify(jwt.sign).bind(jwt);
const verify = pronmisify(jwt.verify).bind(jwt);

exports.generateToken = async (payload, secretSignature, tokenLife) => {
  try {
    return await sign(
      {
        payload,
      },
      secretSignature,
      {
        algorithm: "HS256",
        expiresIn: tokenLife,
      }
    );
  } catch (err) {
    console.log(`Error in generate access token:  + ${error}`);
    return null;
  }
};

exports.verifyToken = async (token, secretKey) => {
  try {
    return await verify(token, secretKey);
  } catch (error) {
    console.log(`Error in verify access token:  + ${error}`);
    return null;
  }
};

exports.decodeToken = async (token, secretKey) => {
  try {
    return await verify(token, secretKey, {
      ignoreExpiration: true,
    });
  } catch (error) {
    console.log(`Error in decode access token: ${error}`);
    return null;
  }
};
