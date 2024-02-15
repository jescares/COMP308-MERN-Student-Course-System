// Load the required modules
const express = require("express");
const router = express.Router();
const studentController = require("../controllers/students.server.controller");

module.exports = function (app) {
  //lists all students (admin only)
  app.get(
    "/students/list",
    studentController.requiresLogin,
    studentController.listStudents
  );
  //lists all courses a student is registered for
  app.get(
    "/students/courses",
    studentController.requiresLogin,
    studentController.listRegisteredCourses
  );
  //gets a student by id
  app.param(
    "/students/studentId",
    studentController.requiresLogin,
    studentController.studentByID
  );
  //lists all students in a course
  app.get(
    "/students/courses/:courseId",
    studentController.requiresLogin,
    studentController.listStudentsInCourse
  );
  //creates a student (admin only)
  app.post(
    "/students/create",
    studentController.requiresLogin,
    studentController.create
  );

  // Route to update student information
  app.put(
    "/students/update",
    studentController.requiresLogin,
    studentController.update
  );

  // Route to remove a course from a student's course list
  app.delete(
    "/courses/:courseId/removeFromList",
    studentController.removeCourseFromList
  );

  app.post("/signin", studentController.authenticate);
  app.get("/signout", studentController.signout);
  app.get("/read_cookie", studentController.isSignedIn);
  //path to a protected page
  app.get("/welcome", studentController.welcome);
};

module.exports = router;
