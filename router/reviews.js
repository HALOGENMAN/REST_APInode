const express = require("express")

const controller = require("../controlers/reviews")

const router = express.Router({mergeParams:true})

const Review = require("../models/Review")

const middleware = require("../middleware/auth")

const advanceResults = require("../middleware/advanceResults")

router.route("/")
    .get(advanceResults(Review,{path:"bootcamp",select:"name description"}),controller.getReviews)
    .post(middleware.protect,middleware.authorize("user", "admin"),controller.addReview)

router.route("/:id")
    .get(controller.getReview)
    .put(middleware.protect,middleware.authorize("user", "admin"),controller.updateReview)
    .delete(middleware.protect,middleware.authorize("user", "admin"),controller.deleteReview)


module.exports = router