// Load the module dependencies
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const Schema = mongoose.Schema;

//Define a schema
const studentSchema = new Schema({
  studentNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // Validate the 'password' value length
    validate: [
      (password) => password && password.length > 8,
      "Password should be longer than 8 characters.",
    ],
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    // Validate the email format
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
  },
  program: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "student", // Default role for students
  },

  favCourse: {
    type: String,
    required: true,
  },
  favProgLang: {
    type: String,
    required: true,
  },
  courses: {
    type: [String],
  },
});

// Set the 'fullname' virtual property
studentSchema
  .virtual("fullName")
  .get(function () {
    return this.firstName + " " + this.lastName;
  })
  .set(function (fullName) {
    const splitName = fullName.split(" ");
    this.firstName = splitName[0] || "";
    this.lastName = splitName[1] || "";
  });

// Use a pre-save middleware to hash the password
// before saving it into database
studentSchema.pre("save", function (next) {
  //hash the password before saving it
  this.password = bcrypt.hashSync(this.password, saltRounds);
  next();
});

// Create an instance method for authenticating user
studentSchema.methods.authenticate = function (password) {
  //compare the hashed password of the database
  //with the hashed version of the password the user enters
  return this.password === bcrypt.hashSync(password, saltRounds);
};

// Configure the 'UserSchema' to use getters and virtuals when transforming to JSON
studentSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});
// Create the 'Student' model out of the 'StudentSchema'
const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
