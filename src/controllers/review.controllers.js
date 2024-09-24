import { Project } from "../models/project.models.js";
import { Review } from "../models/review.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"

const addReview = asyncHandler(async (req, res) => {

    const { name , designation , rating , review , email , mobileNumber , projectId } = req.body;

    if(
        [ name , review ,projectId].some((fields) => fields?.trim() === "")
    ) {
        throw new ApiError(400, "Please fill all the fields")
    }

    if(!(email || mobileNumber)) {
        throw new ApiError(400, "Please provide an email or mobile number")
    }

    if(parseFloat(rating)) {
        if(rating < 1 || rating > 5) {
            throw new ApiError(400, "Rating should be between 1 and 5")
        } 
    } else {
        throw new ApiError(400, "Rating should be a number or a floating point number")
    }

    const isValidProject = await Project.findById(projectId);

    if(!isValidProject) {
        throw new ApiError(404, "Project not found")
    }

    const newReview = await Review.create({
        name,
        designation,
        rating,
        review,
        email,
        mobileNumber,
        projectId,
    })

    return res.status(201).json(
        new ApiResponse(200 , newReview ,"Review Created Successfully")
    ) 
    
})

const editReview = asyncHandler(async (req ,res) => {
    const { id } = req.params;
    const { name, designation, rating, review, email, mobileNumber } = req.body;

    if(!(name || mobileNumber || email || review || designation || rating)) {
        throw new ApiError(400, "Please fill The field You want to edit")
    }

    if( email || mobileNumber) {
        if(email.trim() == '' || mobileNumber.trim() == '') {
            throw new ApiError(400, "Please provide an email or mobile number")
        }
    }

    if(parseFloat(rating)) {
        if(rating < 1 || rating > 5) {
            throw new ApiError(400, "Rating should be between 1 and 5")
        } 
    } else {
        throw new ApiError(400, "Rating should be a number or a floating point number")
    }

    const isValidReview = await Review.findById(id);
    
    if(!isValidReview) {
        throw new ApiError(404, "Review not found")
    }

    const UpdateReview = await Review.findByIdAndUpdate(id , {
        $set : {
            name,
            designation,
            rating,
            review,
            email,
            mobileNumber,
        }
    },
    {
        new : true,
    }
    )

    return res.status(200).json(
        new ApiResponse(200, UpdateReview, "Review updated successfully")
    )
 
})

const deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const isValidId = Review.findById(id);

    if(!isValidId) {
        throw new ApiError(404, "Review not found")
    }

    await Review.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, null, "Review deleted successfully")
    )
})

export {
    addReview, 
    editReview,
    deleteReview,  
}