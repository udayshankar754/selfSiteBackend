import { ProjectImage } from "../models/projectImage.models.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { removeFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";



const addProjectImage = asyncHandler(async (req, res) => { 
  const { alt , info , description } = req.body;

  const projectImageLocalPath = req.file?.path

  if(!projectImageLocalPath) {
    throw new ApiError(400, "Image File Is Required")
  }

  const projectImageLink = await uploadOnCloudinary(projectImageLocalPath , "image" , 'projectImage');

  if(!projectImageLink) {
    throw new ApiError(500, "Failed To Upload Image")
  }

  const projectImage = await ProjectImage.create({
    url : projectImageLink?.url ? projectImageLink?.url : "",
    alt : alt ? alt : projectImageLink?.public_id ? `${projectImageLink?.public_id } Not Found `: "",
    info ,
    description,
  })

  return res
  .status(200)
  .json(
      new ApiResponse( 200 , projectImage , "Project Image Added Successfully")
  )
});

const updateProjectImage = asyncHandler(async (req, res) => {
  const projectImageLocalPath = req.file?.path
  const  projectImageId = req.params.id

  if(!projectImageLocalPath) {
    throw new ApiError(400, "Image File Is Required")
  }

  if(! projectImageId) {
    throw new ApiError(400, "Project Image Id Is Required")
  }

  const isValidProjectImage = await ProjectImage.findById( projectImageId);

  if(!isValidProjectImage) {
    throw new ApiError(404, "Project Image Not Found ! Plese Provide a Valid Id");
  }

  const projectImage = await uploadOnCloudinary(projectImageLocalPath , "image" , 'projectImage');

  if(!projectImage) {
    throw new ApiError(500, "Failed To Upload Image")
  }

  const removedProjectImage = await removeFromCloudinary(isValidProjectImage?.url , "image");
  
  if(!removedProjectImage) {
    console.log("Unable to Remove Image From Cloudinary" ,isValidProjectImage?.url );
  }
  
  const updatedProjectImage = await ProjectImage.findByIdAndUpdate(projectImageId, {
      $set : {
        url : projectImage?.url ? projectImage?.url : ''
      }
    },
    { new: true }
  );

  return res
 .status(200)
 .json(
   new ApiResponse( 200, removedProjectImage ?  { removedImage : removedProjectImage ,updatedData :updatedProjectImage } : 
    {
      removeImage :  {
        oldImage : isValidProjectImage?.url,
        message : "Please Delete the Old Image From Cloudinary"
      },
      updatedData : updatedProjectImage
   }, "Project Image Updated Successfully")
 )
});

const updateProjectImageInfo = asyncHandler(async (req, res) => {
  const { alt , info , description } = req.body;

  if(!(alt || info || description)) {
    throw new ApiError(400, "Please Fill field You wnat to change")
  }

  const projectImageId = req.params.id

  if(!projectImageId) {
    throw new ApiError(400, "Project Image Id Is Required")
  }

  const isValidProjectImage = await ProjectImage.findById(projectImageId);

  if(!isValidProjectImage) {
    throw new ApiError(404, "Project Image Not Found ! Plese Provide a Valid Id")
  }
  
  const updatedProjectImageInfoData = await ProjectImage.findByIdAndUpdate(projectImageId, {
      $set : {
       alt,
       info,
       description
      }
    },
    { new: true }
  );

  return res
 .status(200)
 .json(
   new ApiResponse( 200, {
      removedData : { alt : isValidProjectImage?.alt , info : isValidProjectImage?.info , description : isValidProjectImage?.description } ,
      updatedData : updatedProjectImageInfoData
   }, "Project Image Data Updated Successfully")
 )  
});

const deleteProjectImage = asyncHandler(async (req, res) => {
  const projectImageId = req.params.id

  if(!projectImageId) {
    throw new ApiError(400, "Project Image Id Is Required")
  }

  const isValidProjectImage = await ProjectImage.findById(projectImageId);

  if(!isValidProjectImage) {
    throw new ApiError(404, "Project Image Not Found ! Plese Provide a Valid Id")
  }

  const removedProjectImage = await removeFromCloudinary(isValidProjectImage?.url , "image");
  
  if(!removedProjectImage) {
    console.log("Unable to Remove Image From Cloudinary" ,isValidProjectImage?.url );
  }

  const deleteWhyUsImage = await ProjectImage.findByIdAndDelete(projectImageId);

  return res
 .status(200)
 .json(
   new ApiResponse( 200, removedProjectImage ?  {data : deleteWhyUsImage } : 
    {
      removeImage :  {
        oldimage : isValidProjectImage?.url,
        message : "Please Delete the Old Image From Cloudinary"
      },
      data : deleteWhyUsImage,
   }, "Project Image Deleted Successfully")
 )  
});


export {
  addProjectImage,
  updateProjectImage,
  updateProjectImageInfo,
  deleteProjectImage,
}