// Load the module dependencies
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
    validate: [
      (password) => password && password.length > 8,
      "Password should be longer than 8 characters.",
    ],
  },

  email: {
    type: String,
    // Validate the email format
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
  },

  role: {
    type: String,
    default: "admin", // Default role for admins
  },
});

adminSchema.pre("save", function (next) {
  // Ensure password is hashed before saving the document
  this.password = bcrypt.hashSync(this.password, saltRounds);
  next();
});

adminSchema.methods.authenticate = function (password) {
  return this.password === bcrypt.hashSync(password, saltRounds);
};

adminSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});

mongoose.model("Admin", adminSchema);
module.exports = Admin;
