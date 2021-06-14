const Review = require("../models/Review")
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require("../models/Bootcamp")
// const Bootcamp = require("../models/Bootcamp")


//@desc    Get reviews
//@route   GET /api/v1/reviews
//@route   GET /api/v1/bootcamp/:bootcampId/reviews
//@access  Public
exports.getReviews = async (req,res,next) => {
    try{
        if(req.params.bootcampId){
            const  data = await Review.find({bootcamp:req.params.bootcampId})
            return res.status(200).json({success:true,count:data.length,data:data})
        }else{
            return res.status(200).json(res.advanceResults)
        }

    }catch(err){next(err)}
}

//@desc    Get single reviews
//@route   GET /api/v1/review/:id
//@access  Public
exports.getReview = (req,res,next) => {
    Review.findById(req.params.id).populate({path:'bootcamp',select:"name description"})
    .then(data=>{
        if(!data){
            return  next(new ErrorResponse(`Review not found with ID:${req.params.id} `,404))
        }
        res.status(200).json({sucsess:true,data:data});
    })
    .catch(err=>next(err))
}

//@desc    Add reviews for bootcamp
//@route   POST /api/v1/bootcamp/:bootcampId/review/
//@access  private
exports.addReview = (req,res,next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id

    Bootcamp.findById(req.params.bootcampId)
    .then(data=>{
        if(!data){
            return  next(new ErrorResponse(`Bootcamp not found with ID:${req.params.bootcampId} `,404))
        }
        return Review.create(req.body)
    })
    .then(data=>{
        res.status(200).json({sucsess:true,data:data});
    })
    .catch(err=>next(err))
}

//@desc    Update reviews by user
//@route   PUT /api/v1/review/:id
//@access  private
exports.updateReview = (req,res,next) => {

    Review.findById(req.params.id)
    .then(data=>{
        if(!data){
            return  next(new ErrorResponse(`Review not found with ID:${req.params.id} `,404))
        }
        if(data.user.toString() !== req.user.id && req.user.role !== "admin"){
            return  next(new ErrorResponse(`Not authorized to update review`,401))
        }
        return Review.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
    })
    .then(data=>{
        res.status(200).json({sucsess:true,data:data});
    })
    .catch(err=>next(err))
}

//@desc    Delete reviews by user
//@route   DELETE /api/v1/review/:id
//@access  private
exports.deleteReview = (req,res,next) => {

    Review.findById(req.params.id)
    .then(data=>{
        if(!data){
            return  next(new ErrorResponse(`Review not found with ID:${req.params.id} `,404))
        }
        if(data.user.toString() !== req.user.id && req.user.role !== "admin"){
            return  next(new ErrorResponse(`Not authorized to update review`,401))
        }
        return data.remove()
    })
    .then(()=>{
        res.status(200).json({sucsess:true,data:{}});
    })
    .catch(err=>next(err))
}