
const advanceResults = (model,populate) => async (req,res,next) => {
    const reqQuery = {...req.query}

    //field exclude
    const removeFields = ['select','sort',"page","limit"]

    removeFields.forEach(pram => delete reqQuery[pram])

    //make ruery to string
    let queryStr = JSON.stringify(reqQuery)

    //replace it with actual mongodb variables
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/,match=>`$${match}`)
    try{
        //Find all bootcamps
        let query =  model.find(JSON.parse(queryStr))
        
        //for Select
        if(req.query.select){
            const fields = req.query.select.split(",").join(" ")
            query = query.select(fields)
        }

        //for sort
        if(req.query.sort){
            const sortBy = req.query.sort.split(",").join(" ")
            query = query.sort(sortBy)
        }else{
            query = query.sort('-createdAt')
        }
        
        //Pagination
        const page  = parseInt(req.query.page,10) || 1;
        const limit  = parseInt(req.query.limit,10) || 25;
        const startIndex = (page-1) * limit
        const endIndex = page * limit
        const total = await model.countDocuments() 
        query = query.skip(startIndex).limit(limit)
       
       
        //check populate
        if(populate){
            query.populate(populate)
        }

        //Excluding query
        const data = await query
        
        //Pagination result
        const pagination = {}

        if(startIndex>0){
            pagination.prev = {
                page:page-1,
                limit
            }
        }
        if(endIndex<total){
            pagination.next = {
                page:page+1,
                limit
            }
        }
        res.advanceResults =  {
            success:"true",
            count:data.length,
            pagination:pagination,
            data:data

        }
    }catch(err){
        next(err)
    }
    next()
}

module.exports = advanceResults