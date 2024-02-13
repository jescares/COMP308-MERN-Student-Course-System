const express = require("express");
const router = express.Router();
const studentController = require("../controllers/students.server.controller");

// Routes for students
router.get("/", studentController.getAllStudents);
router.get("/:id", studentController.getStudentById);
router.post("/", studentController.createStudent);
router.put("/:id", studentController.updateStudent);
router.delete("/:id", studentController.deleteStudent);

module.exports = router;