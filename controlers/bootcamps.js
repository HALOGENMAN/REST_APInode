const path = require("path")
const Bootcamp = require("../models/Bootcamp")
const geocoder = require("../utils/geocoder")

const ErrorResponse = require('../utils/errorResponse');

//@desc    Get all bootcamps
//@route   GET /api/v1/bootcamps
//@access  Public
exports.getBootcamps = async (req,res,next) => {
    res.status(200).json(res.advanceResults)
    // Bootcamp.find(JSON.parse(queryStr))
    // .then(data=>{
    //     if(req.query.select){
    //         const fields = req.query.select.split(",").join(" ")
    //         console.log(fields)
    //         data = data.select(fields)
    //     }
    //     res.status(200).json({sucsess:true,count:data.length,data:data});
    // })
    // .catch(err=>next(err))
    
}

//@desc    Get single bootcamps
//@route   GET /api/v1/bootcamps/:id
//@access  Public
exports.getBootcamp = (req,res,next) => {
    Bootcamp.findById(req.params.id)
    .then(data=>{
        if(!data){
            return  next(new ErrorResponse(`Bootcamp not found with ID:${req.params.id} `,404))
        }
        res.status(200).json({sucsess:true,data:data});
    })
    .catch(err=>next(err))
}

//@desc    Create new bootcamps
//@route   POST /api/v1/bootcamps
//@access  Private
exports.createBootcamp = (req,res,next) => {
    req.body.user = req.user.id
    Bootcamp.findOne({user:req.user.id})
    .then(count=>{
        if(count && req.user.role !== "admin"){
            return next(new ErrorResponse(`The user with ID:${req.user.id} already published a bootcamp`,400))
        }
        return Bootcamp.create(req.body)
    })
    .then(data=>{
        res.status(201).json({sucsess:true,data:data});
    })
    .catch(err=>next(err))
}

//@desc    Update a bootcamps
//@route   PUT /api/v1/bootcamps/:id
//@access  Private
exports.updateBootcamp = (req,res,next) => {
    Bootcamp.findById(req.params.id)
    .then(data=>{
        if(!data){
            return  next(new ErrorResponse(`Bootcamp not found with ID:${req.params.id} `,404))
        }

        // make sure user is bootcamp owner
        if(data.user.toString() !== req.user.id && req.user.role !== "admin"){
            return next(new ErrorResponse(`User:${req.params.id} is not authorized to Update this bootcamp`,401))
        }
        return Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })
    })
    .then(data=>{
        res.status(200).json({sucsess:true,data:data});
    })
    .catch(err=>next(err))
}

//@desc    Delete a bootcamps
//@route   DELETE /api/v1/bootcamps/:id
//@access  Private
exports.deleteBootcamp = (req,res,next) => {
    Bootcamp.findById(req.params.id)
    .then(data=>{
        if(!data){
            return  next(new ErrorResponse(`Bootcamp not found with ID:${req.params.id} `,404))
        }

        // make sure user is bootcamp owner
        if(data.user.toString() !== req.user.id && req.user.role !== "admin"){
            return next(new ErrorResponse(`User:${req.params.id} is not authorized to Delete this bootcamp`,401))
        }
        data.remove() 
        res.status(200).json({sucsess:true,data:{}});
    })
    .catch(err=>next(err))
}

//@desc    Get bootcamps within radius
//@route   GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access  Public
exports.GetBootcampInRadius = (req,res,next) => {
    geocoder.geocode(req.params.zipcode)
    .then(loc=>{
        const lat = loc[0].latitude;
        const lng = loc[0].longitude;

        // Calc radius using radians
        // Divide dist by radius of Earth
        // Earth Radius = 3,963 mi / 6,378 km
        const radius = req.params.distance / 3963;
        return Bootcamp.find({
            location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
          })
    })
    .then(data=>{
        res.status(200).json({
            success: true,
            count: data.length,
            data: data
          });
    })   
    .catch(err=>next(err))
}

//@desc    Upload photo for bootcamps
//@route   PIUT /api/v1/bootcamps/:id/photo
//@access  Private
exports.bootcampPhotoUpload = (req,res,next) => {
    Bootcamp.findById(req.params.id)
    .then(data=>{
        if(!data){
            return  next(new ErrorResponse(`Bootcamp not found with ID:${req.params.id} `,404))
        }
        
        // make sure user is bootcamp owner
        if(data.user.toString() !== req.user.id && req.user.role !== "admin"){
            return next(new ErrorResponse(`User:${req.params.id} is not authorized to update this bootcamp`,401))
        }

        if(!req.files) {
            return  next(new ErrorResponse(`Please upload a file `,400))
        }    
        const file = req.files.files

        //check image is a photo
        if(!file.mimetype.startsWith('image')) {
            return  next(new ErrorResponse(`Please upload image file `,400))
        }

        //check file size
        if(file.size > process.env.MAX_FILE_UPLOAD) {
            return  next(new ErrorResponse(`Please upload image less than size ${process.env.MAX_FILE_UPLOAD} `,400))
        }

        //Create a file name with extension
        file.name = `photo_${data._id}${path.parse(file.name).ext}`

        //send to perticular path
        file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
            if(err){
                console.log(err)
                return  next(new ErrorResponse(`Problem with Upload`,500))
            }

            await Bootcamp.findByIdAndUpdate(data._id,{photo:file.name})

            res.status(200).json({success:true,data:file.name})
        })
    })
    .catch(err=>next(err))
    
    
}
