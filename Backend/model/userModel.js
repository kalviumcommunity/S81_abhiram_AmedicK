const mongoose = require("mongoose");
const DocterModel = require("../model/docterModel");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String
  },
  doctorDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  dateJoined: {
    type: Date,
    default: Date.now,
  },
});

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
