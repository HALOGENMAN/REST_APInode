const path = require("path")
const express = require("express")
const dotenv = require("dotenv")
const morgan = require("morgan");
const cookieParser = require('cookie-parser')
const fileupload = require("express-fileupload")
const mongoose = require("mongoose");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const xss = require('xss-clean')
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require('cors')

const errorHandler = require("./middleware/errorHandler")


//env
dotenv.config({path:'./config/config.env'})

//Route files
const bootcamps = require("./router/bootcamps");
const courses = require("./router/courses");
const auth = require("./router/auth")
const users = require("./router/users")
const reviews = require("./router/reviews")


const app = express()

//Body parser
app.use(express.json())

// Sanitize data , To remove data, use:
app.use(mongoSanitize());

//Set security headders
app.use(helmet());

//Secure cross-site scripting
app.use(xss())

//Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter)

//prevent http param pollution
app.use(hpp())

//Enable cors
app.use(cors())

if(process.env.NODE_ENV === 'devlopment'){
    app.use(morgan("dev"))
}

//file upload middleware
app.use(fileupload())

//cookie parser middleware
app.use(cookieParser())

//set static folder
app.use(express.static(path.join(__dirname,'public')))

app.use("/api/v1/bootcamps",bootcamps)
app.use("/api/v1/courses",courses)
app.use("/api/v1/auth",auth)
app.use("/api/v1/users",users)
app.use("/api/v1/reviews",reviews)


//error middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000 


mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(process.env.MONGOOSE_URI,{
    useNewUrlParser:true,
    useUnifiedTopology: true
})
.then((conn)=>{
    app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode in ${PORT} `))
    console.log(`MongoDB Connected ${conn.connection.host}`);
})