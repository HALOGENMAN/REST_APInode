const express = require("express")
const controllers = require("../controlers/bootcamps")
const courseRouter = require("./courses")
const reviewRouter = require("./reviews")
const Bootcamp = require("../models/Bootcamp") 
const advanceResults = require("../middleware/advanceResults")
const router = express.Router();

const middleware = require("../middleware/auth")


//re-roure from cources
router.use("/:bootcampId/courses",courseRouter)

//re-roure from reviews
router.use("/:bootcampId/reviews",reviewRouter)

router.route("/radius/:zipcode/:distance").get(controllers.GetBootcampInRadius)

router.route("/")
    .get(advanceResults(Bootcamp,"courses"),controllers.getBootcamps)
    .post(middleware.protect,middleware.authorize("publisher", "admin"),controllers.createBootcamp)

router.route("/:id")
    .get(controllers.getBootcamp)
    .put(middleware.protect,middleware.authorize("publisher", "admin"),controllers.updateBootcamp)
    .delete(middleware.protect,middleware.authorize("publisher", "admin"),controllers.deleteBootcamp)

router.route("/:id/photo").put(middleware.protect,middleware.authorize("publisher", "admin"), controllers.bootcampPhotoUpload)
module.exports = router;