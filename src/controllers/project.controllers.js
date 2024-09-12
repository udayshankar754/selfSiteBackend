import mongoose from "mongoose"

const addComment = asyncHandler(async (req, res) => {

    const { content } = req.body;
    const { id , type } = req.params;
    
    if (!TypeEnum.includes(type)) {
        throw new ApiError(400 , 'Invalid type. Type is of tweet, video,comment');
    }

    if(! content) {
        throw new ApiError(400, "Please enter a comment")
    }

    const referencedObject = await mongoose.model(type.charAt(0).toUpperCase() + type.slice(1)).findById(id);

    if (!referencedObject) {
        throw new ApiError(404, `${type.charAt(0).toUpperCase() + type.slice(1)} does not exist`);
    }

    const comments = await Comment.create({
       content,
       owner : req.user?._id,
       [type]: id // Dynamically add the type field
    })

    if( ! comments) {
        throw new ApiError(500, "Something went wrong When Createing Comment")
    }
    
    return res.status(201)
    .json(new ApiResponse( 201 , comments , "Comment created Successfully" ))
})

export {
    addComment, 
}