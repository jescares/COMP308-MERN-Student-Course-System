const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Course schema
const courseSchema = new Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
});

// Create and export the Course model
const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
