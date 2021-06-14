const express = require("express")

const courseController = require("../controlers/courses")

const router = express.Router({mergeParams:true})

const Course = require("../models/Course")

const middleware = require("../middleware/auth")


const advanceResults = require("../middleware/advanceResults")

router.route("/")
    .get(advanceResults(Course,{path:"bootcamp",select:"name description"}),courseController.getCourses)
    .post(middleware.protect,middleware.authorize("publisher", "admin"),courseController.createCourse)

router.route("/:id")
    .get(courseController.getCourse)
    .put(middleware.protect,middleware.authorize("publisher", "admin"),courseController.updateCourse)
    .delete(middleware.protect,middleware.authorize("publisher", "admin"),courseController.deleteCourse)


module.exports = router