const mongoose = require("mongoose")
const slugify = require("slugify")
const geocoder = require("../utils/geocoder")

const Schema = mongoose.Schema

var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/
var regxEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const bootcampSchema = new Schema({
    name:{
        type:String,
        required:[true,'please add a name to your bootcamp'],
        unique:true,
        trim:true,
        maxlength:[50,'max length of your bootcamp should be 50 letters'] 
    },
    slug:String,
    description:{
        type:String,
        required:[true,'please add a name to your description'],
        maxlength:[500,'max length of your description should be 500 letters']     
    },
    website:{
        type:String,
        match:[
            urlPattern,
            'please use valid URL HTTP of HTTPS'
        ]
    },
    phone:{
        type:String,
        maxlength:[20,'phone no cn=ant be longer than 20 character']
    },
    email:{
        type:String,
        match:[
            regxEmail,
            'please add valid email'
        ]
    },
    address:{
        type:String,
        required:[true,'please enter your address']
    },
    careers:{
        //array of strings
        type:[String],
        required:true,
        enum:[
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    location:{
        //geoJSON  Point
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            // required: true
        },
        coordinates: {
            type: [Number],
            // required: true,
            index:'2dsphere'
        },
        formattedAddress:String,
        street:String,
        city:String,
        state:String,
        zipcode:String,
        country:String,
    },
    averageRating:{
        type:Number,
        min:[1,'rating must be atleast 1'],
        max:[10,'rating cannot be mote than 10']
    },
    averageCost:Number,
    photo:{
        type:String,
        default:"no-photo.jpg",
    },
    housing:{
        type:String,
        default:false
    },
    jobAssistance:{
        type:String,
        default:false
    },
    jobGurantee:{
        type:String,
        default:false
    },
    acceptGi:{
        type:String,
        default:false
    },
    createdAt:{
        type:Date,
        default : Date.now()
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
},{
    toJSON:{virtuals:true},
    toObjects:{vartuals:true}
})

//Create bootcmp slug from name

bootcampSchema.pre("save",function(next){
    this.slug = slugify(this.name,{lower:true})
    next()
})


bootcampSchema.pre('save', async function(next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress,
      street: loc[0].streetName,
      city: loc[0].city,
      state: loc[0].stateCode,
      zipcode: loc[0].zipcode,
      country: loc[0].countryCode
    };
  
    // Do not save address in DB
    this.address = undefined;
    next();
});

//Cascade delete courses when a bootcamp is deleted
bootcampSchema.pre("remove",async function(next) {
    await this.model("Course").deleteMany({ bootcamp: this._id})
    next();
})

//Riverse populate with virtual
bootcampSchema.virtual('courses',{
    ref:'Course',
    localField:'_id',
    foreignField:'bootcamp',
    justOne: false
})

module.exports = mongoose.model('Bootcamp',bootcampSchema); 