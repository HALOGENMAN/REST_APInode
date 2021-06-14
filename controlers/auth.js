const User = require("../models/User")
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require("../utils/sendEmail")
const crypto  = require("crypto")

//@desc    Register user
//@route   POST /api/v1/auth/register
//@access  Public
exports.register = (req,res,next) => {
    User.create(req.body)
    .then(data=>{
        // send token with cookie
        sendTokenResponse(data,200,res)
    })
    .catch(err=>next(err))
}

//@desc    login user
//@route   POST /api/v1/auth/login
//@access  Public
exports.login = (req,res,next) => {
    const { email, password } = req.body;
  
    //validate email & password
    if(!email  || !password){
        return next(new ErrorResponse(`Please provide email and password`,400))
    }
    User.findOne({email:email}).select("+password")
    .then(data=>{
        if(!data){
            return next(new ErrorResponse(`Invalid credentials`,401))
        }
        
        //check password
        data.matchPassword(password)
        .then(check=>{
            if(!check){
                return next(new ErrorResponse(`password doesnot match`,401))
            }
            
            // send token with cookie
            sendTokenResponse(data,200,res)
            
        })
        
    })
    
    .catch(err=>next(err))
}

//@desc    logout user
//@route   GET /api/v1/auth/logout
//@access  Private
exports.logout = (req,res,next) => {
    res.cookie("token","none",{
        expires:new Date(Date.now()+10 *1000),
        httpOnly:true
    })
    res.status(200).json({success:true,data:{}})
}

//@desc    get user
//@route   GET /api/v1/auth/me
//@access  Private
exports.getMe = (req,res,next) => {
    User.findById(req.user.id)
    .then(data=>{
        
        res.status(200).json({success:true,data:data})
    })
    .catch(err=>next(err))
}

//@desc    Update user details
//@route   PUT /api/v1/auth/updatedetails
//@access  Private
exports.updateDetails = (req,res,next) => {
    const updateFields = {
        email:req.body.email,
        name:req.body.name
    }
    User.findByIdAndUpdate(req.user.id,updateFields,{   new:true, runValidators:true})
    .then(data=>{
        
        res.status(200).json({success:true,data:data})
    })
    .catch(err=>next(err))
}

//@desc    Update password
//@route   PUT /api/v1/auth/updatepassword
//@access  Private
exports.updatePassword = async (req,res,next) => {
    try{
        const data = await User.findById(req.user.id).select("+password")
        //Check current password
        if(!(await data.matchPassword(req.body.currentPassword))){
            return next(new ErrorResponse('password is incorrect',401))
        }
        data.password = req.body.newPassword;
        await data.save({ validateBeforeSave:true })
        sendTokenResponse(data,200,res)
    }catch(err){
        next(err)
    }
}

//@desc    forgot password
//@route   POST /api/v1/auth/forgotpassword
//@access  Public
exports.forgotpassword = async (req,res,next) => {
    try{
        const data = await User.findOne({email:req.body.email})
        if(!data){
            return next(new ErrorResponse(`email doesnot exisst`,401))
        }
        const rsetToken = data.getResetPasswordToken()
        await data.save({ validateBeforeSave:false })
        // Create reset url
        const resetUrl = `${req.protocal}://${req.get("host")}/api/v1/auth/resetpassword/${rsetToken}`
         //message to email
         const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

         try{
            await sendEmail({
                email:data.email,
                subject: 'Password reset token',
                message
            })
            res.status(200).json({success:true,data:'Email sent'})
         }catch(err){
             console.log(err)
             data.resetPasswordToken = undefined
             data.resetPasswordExpire = undefined
             await data.save({ validateBeforeSave:false })
             return next(new ErrorResponse(`Email coudnot be sent`,500))
         }

    }
    catch(err){
        next(err)
    }
    
}

//@desc    Reset password
//@route   POST /api/v1/auth/resetpassword/:resettoken
//@access  Public
exports.resetpassword = async (req,res,next) => {
    try{
        const resetToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
        const data = await User.findOne({resetPasswordToken:resetToken,resetPasswordExpire:{$gt:Date.now()}})
        if(!data){
            return next(new ErrorResponse(`Invalid token`,400))
        }
        //Set new password
        data.password = req.body.password
        data.resetPasswordToken=undefined
        data.resetPasswordExpire=undefined

        await data.save({ validateBeforeSave:true })
        sendTokenResponse(data,200,res)

    }
    catch(err){
        next(err)
    }
    
}

// Get token from model, create cookie ans send response
const sendTokenResponse = (data, statusCode, res) => {
    // Create token
    const token = data.getSingnedJwtToken() 

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 *1000),
        httpOnly:true
    }

    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }

    res.status(statusCode).cookie("token",token,options).json({ success:true, token })
}
