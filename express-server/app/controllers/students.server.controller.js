const Student = require("../models/student.server.model");
const bcrypt = require("bcrypt");

// Controller for handling CRUD operations related to students

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new student
exports.createStudent = async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const student = new Student({
    studentNumber: req.body.studentNumber,
    password: hashedPassword,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    address: req.body.address,
    city: req.body.city,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    program: req.body.program,
    favProgLang: req.body.favProgLang,
    favCourse: req.body.favCourse,
  });

  try {
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        studentNumber: req.body.studentNumber,
        password: hashedPassword,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        city: req.body.city,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        program: req.body.program,
        favProgLang: req.body.favProgLang,
        favCourse: req.body.favCourse,
      },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
