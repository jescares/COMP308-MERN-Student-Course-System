// Load the module dependencies
const Student = require("mongoose").model("Student");
const Course = require("mongoose").model("Course");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const jwtExpirySeconds = 300;
const jwtKey = config.secretKey;

//CREATE FUNCTIONS
exports.create = function (req, res, next) {
  // Check if the user making the request is an admin
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Unauthorized: Only admins can create students" });
  }

  var student = new Student(req.body);
  console.log("body: " + req.body.studentNumber);

  student.save(function (err) {
    if (err) {
      return next(err);
    } else {
      res.json(student);
    }
  });
};

// READ FUNCTIONS
// lists all students
exports.listStudents = function (req, res, next) {
  // Check if the user making the request is an admin
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Unauthorized: Only admins can list students" });
  }

  Student.find({}, function (err, students) {
    if (err) {
      return next(err);
    } else {
      res.json(students);
    }
  });
};

//lists all courses a student is registered for
exports.listRegisteredCourses = function (req, res, next) {
  // Get the student ID from the authenticated user object
  const studentId = req.user._id;

  // Find the student by ID and retrieve their registered courses
  Student.findById(studentId)
    .populate("courses") // Populate the 'courses' field to get course details
    .exec(function (err, student) {
      if (err) {
        return next(err);
      }

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      // Return the list of courses the student is registered for
      res.json(student.courses);
    });
};

//gets a student by their student number
exports.studentByID = function (req, res, next, id) {
  Student.findOne(
    {
      _id: id,
    },
    (err, student) => {
      if (err) {
        return next(err);
      } else {
        req.user = student;
        console.log(student);
        next();
      }
    }
  );
};

//lists all students registered in a course
exports.listStudentsInCourse = function (req, res, next) {
  // Get the course ID from the request parameters
  const courseId = req.params.courseId;

  // Find the course by ID and retrieve the students registered in the course
  Course.findById(courseId)
    .populate("students") // Populate the 'students' field to get student details
    .exec(function (err, course) {
      if (err) {
        return next(err);
      }

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Return the list of students registered in the course
      res.json(course.students);
    });
};

//UPDATE FUNCTIONS
exports.update = function (req, res, next) {
  Student.findByIdAndUpdate(req.user.id, req.body, function (err, student) {
    if (err) {
      console.log(err);
      return next(err);
    } else {
      res.json(student);
    }
  });
};

//updates the section of a course a student is registered in
exports.updateCourseSection = function (req, res, next) {
  // Extract the course ID and new section from the request parameters and body
  const courseId = req.params.courseId;
  const newSection = req.body.section;

  // Find the course by ID
  Course.findById(courseId, function (err, course) {
    if (err) {
      return next(err);
    }

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if the student is enrolled in the course
    if (!course.students.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You are not enrolled in this course" });
    }

    // Update the course's section
    course.section = newSection;

    // Save the updated course
    course.save(function (err, updatedCourse) {
      if (err) {
        return next(err);
      }

      res.json(updatedCourse); // Return the updated course
    });
  });
};

//DELETE FUNCTIONS
//remove course from course list (student)

exports.removeCourseFromList = function (req, res, next) {
  // Check if the user making the request is authenticated (student)
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Student authentication required" });
  }

  // Extract the course ID from the request parameters
  const courseId = req.params.courseId;

  // Find the student by ID and remove the course from their course list
  Student.findByIdAndUpdate(
    req.user._id, // Student ID from the authenticated user object
    { $pull: { courses: courseId } }, // Remove the courseId from the student's courses array
    { new: true },
    function (err, updatedStudent) {
      if (err) {
        return next(err);
      }

      if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json(updatedStudent); // Return the updated student object
    }
  );
};

//
//  AUTHENTICATION
//
exports.authenticate = function (req, res, next) {
  console.log(req.body);
  const studentNumber = req.body.auth.studentNumber;
  const password = req.body.auth.password;
  console.log(studentNumber);
  console.log(password);

  Student.findOne({ studentNumber: studentNumber }, (err, student) => {
    if (err) {
      return next(err);
    } else {
      console.log(student);
      //compare passwords
      if (bcrypt.compareSync(password, student.password)) {
        // Create a new token with the student id in the payload
        // and which expires 300 seconds after issue
        const token = jwt.sign(
          { id: student._id, studentNumber: student.studentNumber },
          jwtKey,
          { algorithm: "HS256", expiresIn: jwtExpirySeconds }
        );
        console.log("token:", token);
        // set the cookie as the token string, with a similar max age as the token
        // here, the max age is in milliseconds
        res.cookie("token", token, {
          maxAge: jwtExpirySeconds * 1000,
          httpOnly: true,
        });
        res.status(200).send({ screen: student.studentNumber });
        //
        //res.json({status:"success", message: "student found!!!", data:{student:
        //student, token:token}});

        req.user = student;
        //call the next middleware
        next();
      } else {
        res.json({
          status: "error",
          message: "Invalid student number/password.",
          data: null,
        });
      }
    }
  });
};

exports.welcome = (req, res) => {
  // We can obtain the session token from the requests cookies,
  // which come with every request
  const token = req.cookies.token;
  console.log(token);
  // if the cookie is not set, return an unauthorized error
  if (!token) {
    return res.status(401).end();
  }

  var payload;
  try {
    // Parse the JWT string and store the result in `payload`.
    // Note that we are passing the key in this method as well. This method will throw an error
    // if the token is invalid (if it has expired according to the expiry time we set on sign in),
    // or if the signature does not match
    payload = jwt.verify(token, jwtKey);
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      // if the error thrown is because the JWT is unauthorized, return a 401 error
      return res.status(401).end();
    }
    // otherwise, return a bad request error
    return res.status(400).end();
  }

  // Finally, return the welcome message to the student, along with their
  // studentname given in the token
  // use back-quotes here
  res.send(`${payload.studentNumber}`);
};
//
//sign out function in controller
//deletes the token on the client side by clearing the cookie named 'token'
exports.signout = (req, res) => {
  res.clearCookie("token");
  return res.status("200").json({ message: "signed out" });
  // Redirect the student back to the main application page
  //res.redirect('/');
};
//check if the student is signed in
exports.isSignedIn = (req, res) => {
  // Obtain the session token from the requests cookies,
  // which come with every request
  const token = req.cookies.token;
  console.log(token);
  // if the cookie is not set, return 'auth'
  if (!token) {
    return res.send({ screen: "auth" }).end();
  }
  var payload;
  try {
    // Parse the JWT string and store the result in `payload`.
    // Note that we are passing the key in this method as well. This method will throw an error
    // if the token is invalid (if it has expired according to the expiry time we set on sign in),
    // or if the signature does not match
    payload = jwt.verify(token, jwtKey);
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      // the JWT is unauthorized, return a 401 error
      return res.status(401).end();
    }
    // otherwise, return a bad request error
    return res.status(400).end();
  }

  // Finally, token is ok, return the studentname given in the token
  res.status(200).send({ screen: payload.studentNumber });
};

//isAuthenticated() method to check whether a student is currently authenticated
exports.requiresLogin = function (req, res, next) {
  // Obtain the session token from the requests cookies,
  // which come with every request
  const token = req.cookies.token;
  console.log(token);
  // if the cookie is not set, return an unauthorized error
  if (!token) {
    return res.send({ screen: "auth" }).end();
  }
  var payload;
  try {
    // Parse the JWT string and store the result in `payload`.
    // Note that we are passing the key in this method as well. This method will throw an error
    // if the token is invalid (if it has expired according to the expiry time we set on sign in),
    // or if the signature does not match
    payload = jwt.verify(token, jwtKey);
    console.log("in requiresLogin - payload:", payload);
    req.id = payload.id;
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      // if the error thrown is because the JWT is unauthorized, return a 401 error
      return res.status(401).end();
    }
    // otherwise, return a bad request error
    return res.status(400).end();
  }
  // student is authenticated
  //call next function in line
  next();
};
