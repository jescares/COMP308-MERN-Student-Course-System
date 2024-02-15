const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courses.server.controller");
const studentController = require("../controllers/students.server.controller");

//Routes for courses
module.exports = function (app) {
  app.get("/courses/list", courseController.listAllCourses);
  app.put(
    "/courses/:courseId/updateSection",
    courseController.updateCourseSection
  );
};

// Route to create a new course (accessible only by admin)
router.post("/courses/create", courseController.createCourse);

module.exports = router;
