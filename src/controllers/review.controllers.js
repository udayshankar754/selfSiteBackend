import { Project } from "../models/project.models.js";
import { Review } from "../models/review.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"

const addReview = asyncHandler(async (req, res) => {

    const { name , designation , rating , review , email , mobileNumber , projectId } = req.body;

    if(
        [ name , rating , review ,projectId].some((fields) => fields?.trim() === "")
    ) {
        throw new ApiError(400, "Please fill all the fields")
    }

    if(!(email || mobileNumber)) {
        throw new ApiError(400, "Please provide an email or mobile number")
    }

    const isValidProject = Project.findById(projectId);

    if(!isValidProject) {
        throw new ApiError(404, "Project not found")
    }

    const newReview = Review.create({
        name,
        designation,
        rating,
        review,
        email,
        mobileNumber,
        projectId,
    })

    return res.status(201).json(
        new ApiResponse(200 , "Review Created Successfully" , newReview)
    ) 
    
})

const editReview = asyncHandler(async (req ,res) => {
    const { id } = req.params;
    const { name, designation, rating, review, email, mobileNumber } = req.body;
})

export {
    addReview, 
}