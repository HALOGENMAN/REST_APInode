const User = require("../models/User")
const ErrorResponse = require('../utils/errorResponse');



//@desc    get all users
//@route   GET /api/v1/users
//@access  Private/Admin
exports.getUsers = (req,res,next) => {
    res.status(200).json(res.advanceResults)
}

//@desc    get single users
//@route   GET /api/v1/users/:id
//@access  Private/Admin
exports.getUser = async (req,res,next) => {
    User.findById(req.params.id)
    .then(data=>{
        res.status(200).json({success:true,data})
    })
    .catch(err=>next(err))
}

//@desc    Create user
//@route   POST /api/v1/users
//@access  Private/Admin
exports.createUser = (req,res,next) => {
    User.create(req.body)
    .then(data=>{
        res.status(201).json({success:true,data})
    })
    .catch(err=>next(err))
}

//@desc    Update user
//@route   PUT /api/v1/users/:id
//@access  Private/Admin
exports.updateUser = (req,res,next) => {
    
    User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
    .then(data=>{
        res.status(200).json({success:true,data})
    })
    .catch(err=>next(err))
}

//@desc    Delete user
//@route   DELETE /api/v1/users/:id
//@access  Private/Admin
exports.deleteUser = (req,res,next) => {
    User.findByIdAndDelete(req.params.id)
    .then(()=>{
        res.status(200).json({success:true,data:{} })
    })
    .catch(err=>next(err))
}