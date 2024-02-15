const Course = require("../models/course.server.model");
const mongoose = require("mongoose");
const Student = require("mongoose").model("Student");

//create function
exports.createCourse = function (req, res, next) {
  // Check if the user making the request is an admin
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Unauthorized: Only admins can create courses" });
  }

  // Create a new course object from the request body
  const newCourse = new Course(req.body);

  // Save the new course to the database
  newCourse.save(function (err, course) {
    if (err) {
      return next(err);
    }

    res.status(201).json(course); // Return the newly created course
  });
};

exports.listAllCourses = function (req, res, next) {
  // Check if the user making the request is an admin
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Unauthorized: Only admins can list all courses" });
  }

  // Retrieve all courses from the database
  Course.find({}, function (err, courses) {
    if (err) {
      return next(err);
    }

    res.json(courses); // Return the list of courses
  });
};
