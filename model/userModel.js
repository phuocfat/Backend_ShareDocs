const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    max: 20,
    min: 5,
    require: true,
    unique: true,
  },
  email: {
    type: String,
    max: 50,
    unique: true,
  },
  password: {
    type: String,
    require: true,
    min: 8,
  },
  avatarImage: {
    type: String,
    default: "",
  },
});
module.exports = mongoose.model("Users", userSchema);
