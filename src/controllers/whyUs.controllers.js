import { WhyUs } from "../models/whyUs.models.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { removeFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const addWhyUs = asyncHandler(async (req, res) => {

  const { title , description } = req.body;

  const userId = req.user?._id;

  if(!userId) {
    throw new ApiError(401, "Unauthorized Access")
  }

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
    image: whyUsImage ? whyUsImage?.url : "",
    userId
  })

  return res
  .status(200)
  .json(
      new ApiResponse( 200 , whyUsImageData , "Why Us Image Added Successfully")
  )
})

const updateWhyUsImage = asyncHandler(async (req , res) => {
  const whyUsImageLocalPath = req.file?.path
  const whyUsId = req.params.id

  if(!whyUsImageLocalPath) {
    throw new ApiError(400, "Image File Is Required")
  }

  if(!whyUsId) {
    throw new ApiError(400, "Why Us Id Is Required")
  }

  const isValidWhyUs = await WhyUs.findById(whyUsId);

  if(!isValidWhyUs) {
    throw new ApiError(404, "Why Us Not Found ! Plese Provide a Valid Id")
  }

  const whyUsImage = await uploadOnCloudinary(whyUsImageLocalPath , "image" , 'whyUs');

  if(!whyUsImage) {
    throw new ApiError(500, "Failed To Upload Image")
  }

  const removedWhyUsImage = await removeFromCloudinary(isValidWhyUs?.image , "image");
  
  if(!removedWhyUsImage) {
    console.log("Unable to Remove Image From Cloudinary" ,isValidWhyUs?.image );
  }
  
  const updatedWhyUsImage = await WhyUs.findByIdAndUpdate(whyUsId, {
      $set : {
        image : whyUsImage?.url ? whyUsImage?.url : ''
      }
    },
    { new: true }
  );

  return res
 .status(200)
 .json(
   new ApiResponse( 200, removedWhyUsImage ?  { removedImage : removedWhyUsImage , updatedWhyUsImage } : 
    {
      removeImage :  {
        oldimage : isValidWhyUs?.image,
        message : "Please Delete the Old Image From Cloudinary"
      },
      data : updatedWhyUsImage
   }, "Why Us Image Updated Successfully")
 )
})

const updateWhyUsDetails = asyncHandler(async (req , res) => {
  const { title , description } = req.body;

  if(!(title || description)) {
    throw new ApiError(400, "Please Fill field You wnat to change")
  }

  const whyUsId = req.params.id

  if(!whyUsId) {
    throw new ApiError(400, "Why Us Id Is Required")
  }

  const isValidWhyUs = await WhyUs.findById(whyUsId);

  if(!isValidWhyUs) {
    throw new ApiError(404, "Why Us Not Found ! Plese Provide a Valid Id")
  }
  
  const updatedWhyUsData = await WhyUs.findByIdAndUpdate(whyUsId, {
      $set : {
        title,
        description
      }
    },
    { new: true }
  );

  return res
 .status(200)
 .json(
   new ApiResponse( 200, {
      removedData : { title : isValidWhyUs?.title , description : isValidWhyUs?.description } ,
      updatedData : updatedWhyUsData
   }, "Why Us Data Updated Successfully")
 )  
})

const deleteWhyUs = asyncHandler(async (req , res) => {
  const whyUsId = req.params.id

  if(!whyUsId) {
    throw new ApiError(400, "Why Us Id Is Required")
  }

  const isValidWhyUs = await WhyUs.findById(whyUsId);

  if(!isValidWhyUs) {
    throw new ApiError(404, "Why Us Not Found ! Plese Provide a Valid Id")
  }

  const removedWhyUsImage = await removeFromCloudinary(isValidWhyUs?.image , "image");
  
  if(!removedWhyUsImage) {
    console.log("Unable to Remove Image From Cloudinary" ,isValidWhyUs?.image );
  }

  const deleteWhyUsImage = await WhyUs.findByIdAndDelete(whyUsId);

  return res
 .status(200)
 .json(
   new ApiResponse( 200, removedWhyUsImage ?  {data : deleteWhyUsImage } : 
    {
      removeImage :  {
        oldimage : isValidWhyUs?.image,
        message : "Please Delete the Old Image From Cloudinary"
      },
      data : deleteWhyUsImage,
   }, "Why Us Deleted Successfully")
 )  
})

export {
  addWhyUs, 
  updateWhyUsImage,
  updateWhyUsDetails,
  deleteWhyUs
}