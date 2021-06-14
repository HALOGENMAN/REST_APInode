const express = require("express")
const router = express.Router({mergeParams:true})

const controller = require("../controlers/auth")
const middleware = require("../middleware/auth")



router.post("/register",controller.register)
router.post("/login",controller.login)
router.get("/logout",controller.logout)
router.get("/me",middleware.protect,controller.getMe)
router.post("/forgotpassword",controller.forgotpassword)
router.put("/resetpassword/:resettoken",controller.resetpassword)
router.put("/updatedetails",middleware.protect,controller.updateDetails)
router.put("/updatepassword",middleware.protect,controller.updatePassword)


module.exports = router