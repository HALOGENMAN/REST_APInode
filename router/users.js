const advanceResults = require("../middleware/advanceResults")
const express = require("express")
const router = express.Router()
const User = require("../models/User")
const controller = require("../controlers/users")
const middleware = require("../middleware/auth")

router.use(middleware.protect)
router.use(middleware.authorize("admin"))

router.route("/").get(advanceResults(User),controller.getUsers).post(controller.createUser)
router.route("/:id").get(controller.getUser).put(controller.updateUser).delete(controller.deleteUser)


module.exports = router