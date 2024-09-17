import { WhyUs } from "../models/whyUs.models.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const addWhyUsImage = asyncHandler(async (req, res) => {

  const { title , description } = req.body;

  const whyUsImageLocalPath = req.file?.path

  if(!whyUsImageLocalPath) {
    throw new ApiError(400, "Image File Is Required")
  }

  const whyUsImage = await uploadOnCloudinary(whyUsImageLocalPath , "image" , 'whyUs');

  if(!whyUsImage) {
    throw new ApiError(500, "Failed To Upload Image")
  }

  const whyUsImageData = await WhyUs.create({
    title,
    description,
    image: whyUsImage ? whyUsImage?.url : ""
  })

  return res
  .status(200)
  .json(
      new ApiResponse( 200 , whyUsImageData , "Why Us Image Added Successfully")
  )
})

const updateWhyUsImage = asyncHandler(async (req , res) => {

})

const updateWhyUsDetails = asyncHandler(async (req , res) => {
  
})

const deleteWhyUsImage = asyncHandler(async (req , res) => {
  
})

export {
  addWhyUsImage, 
  updateWhyUsImage,
  updateWhyUsDetails,
  deleteWhyUsImage
}