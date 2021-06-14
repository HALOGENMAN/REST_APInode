const Course = require("../models/Course")
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require("../models/Bootcamp")

//@desc    Get all courses
//@route   GET /api/v1/courses
//@route   GET /api/v1/bootcamp/:bootcampId/courses
//@access  Public
exports.getCourses = async (req,res,next) => {
    try{
        if(req.params.bootcampId){
            const  data = Course.find({bootcamp:req.params.bootcampId})
            return res.status(200).json({success:true,count:data.length,data:data})
        }else{
            return res.status(200).json(res.advanceResults)
        }


    }catch(err){next(err)}
}

//@desc    Get Single courses
//@route   GET /api/v1/courses/:id
//@access  Public
exports.getCourse = (req,res,next) => {
    Course.findById(req.params.id).populate({
        path:"bootcamp",
        select: "name description"
    })
    .then(data=>{
        if(!data){
            return  next(new ErrorResponse(`Course not found with ID:${req.params.id} `,404))
        }
        res.status(200).json({sucsess:true,data:data});
    })
    .catch(err=>next(err))
}

//@desc    create new courses
//@route   POST /api/v1/bootcamps/:bootcampId/courses
//@access  Private
exports.createCourse = (req,res,next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id
    Bootcamp.findById(req.params.bootcampId)    
    .then(data=>{
        if(!data){
            return  next(new ErrorResponse(`Bootcamp not found with ID:${req.params.bootcampId} `,404))
        }
        // make sure bootcamp is same
        if(data.user.toString() !== req.user.id && req.user.role !== "admin"){
            return next(new ErrorResponse(`User:${req.user.id} is not authorized to Add course  bootcamp:${data._id}`,401))
        }
        return Course.create(req.body)
    })
    .then(()=>{
        res.status(200).json({success:true,data:{}})
    })
    .catch(err=>next(err))
}

//@desc    Update a courses
//@route   PUT /api/v1/courses/:Id
//@access  Private
exports.updateCourse = (req,res,next) => {
    Course.findById(req.params.id)    
    .then(data=>{
        console.log(req.params.id)
        if(!data){
            return  next(new ErrorResponse(`Course not found with ID:${req.params.id} `,404))
        }
        // make sure user course owner
        if(data.user.toString() !== req.user.id && req.user.role !== "admin"){
            return next(new ErrorResponse(`User:${req.user.id} is not authorized to Update course  bootcamp:${data._id}`,401))
        }
        return Course.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })
    })
    .then(()=>{
        res.status(200).json({success:true,data:{}})
    })
    .catch(err=>next(err))
}

//@desc    Delete a courses
//@route   DELETE /api/v1/courses/:Id
//@access  Private
exports.deleteCourse = (req,res,next) => {
    Course.findById(req.params.id)    
    .then(data=>{
        console.log(req.params.id)
        if(!data){
            return  next(new ErrorResponse(`Course not found with ID:${req.params.id} `,404))
        }
        // make sure User is course owner
        if(data.user.toString() !== req.user.id && req.user.role !== "admin"){
            return next(new ErrorResponse(`User:${req.user.id} is not authorized to Delete  course  bootcamp:${data._id}`,401))
        }
       data.remove()
       res.status(200).json({success:true,data:{}})
    })
    .catch(err=>next(err))
}
