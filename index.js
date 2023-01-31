const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./route/userRoute");
const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", userRoute);

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to database!!!");
  })
  .catch((err) => {
    console.log(err.message);
  });

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("server listening on port " + PORT);
});
