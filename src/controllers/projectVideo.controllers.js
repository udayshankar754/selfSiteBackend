import { ProjectVideo } from "../models/projectVideo.models.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { removeFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";



const addProjectVideo = asyncHandler(async (req, res) => {
  const { alt , info , description } = req.body;

  const projectVideoLocalPath = req.file?.path

  if(!projectVideoLocalPath) {
    throw new ApiError(400, "Video File Is Required")
  }

  const projectVideoLink = await uploadOnCloudinary(projectVideoLocalPath , "video" , 'projectVideo');

  if(!projectVideoLink) {
    throw new ApiError(500, "Failed To Upload Video File")
  }
  console.log(projectVideoLink);

  const projectVideo = await ProjectVideo.create({
    url : projectVideoLink?.url ? projectVideoLink?.url : "",
    alt : alt ? alt : projectVideoLink?.public_id ? `${projectVideoLink?.public_id } Not Found `: "",
    info ,
    description,
  })

  return res
  .status(200)
  .json(
      new ApiResponse( 200 , projectVideo , "Project Video Added Successfully")
  )
});

const updateProjectVideo = asyncHandler(async (req, res) => {
  const projectVideoLocalPath = req.file?.path
  const  projectVideoId = req.params.id

  if(!projectVideoLocalPath) {
    throw new ApiError(400, "Video File Is Required")
  }

  if(! projectVideoId) {
    throw new ApiError(400, "Project Video Id Is Required")
  }

  const isValidProjectVideo = await ProjectVideo.findById( projectVideoId);

  if(!isValidProjectVideo) {
    throw new ApiError(404, "Project Video Not Found ! Plese Provide a Valid Id");
  }

  const projectVideo = await uploadOnCloudinary(projectVideoLocalPath , "video" , 'projectVideo');

  if(!projectVideo) {
    throw new ApiError(500, "Failed To Upload Video");
  }

  const removedProjectVideo = await removeFromCloudinary(isValidProjectVideo?.url , "video");
  
  if(!removedProjectVideo) {
    console.log("Unable to Remove Image From Cloudinary" ,isValidProjectVideo?.url );
  }
  
  const updatedProjectVideo = await ProjectVideo.findByIdAndUpdate(projectVideoId, {
      $set : {
        url : projectVideo?.url ? projectVideo?.url : ''
      }
    },
    { new: true }
  );

  return res
 .status(200)
 .json(
   new ApiResponse( 200, removedProjectVideo ?  { removedVideo : removedProjectVideo ,updatedData :updatedProjectVideo } : 
    {
      removeImage :  {
        oldVideo : isValidProjectVideo?.url,
        message : "Please Delete the Old Video From Cloudinary"
      },
      updatedData : updatedProjectVideo
   }, "Project Video Updated Successfully")
 )
});

const updateProjectVideoInfo = asyncHandler(async (req, res) => {
  const { alt , info , description } = req.body;

  if(!(alt || info || description)) {
    throw new ApiError(400, "Please Fill field You wnat to change")
  }

  const projectVideoId = req.params.id

  if(!projectVideoId) {
    throw new ApiError(400, "Project Video Id Is Required")
  }

  const isValidProjectVideo = await ProjectVideo.findById(projectVideoId);

  if(!isValidProjectVideo) {
    throw new ApiError(404, "Project Video Not Found ! Plese Provide a Valid Id")
  }
  
  const updatedProjectImageInfoData = await ProjectVideo.findByIdAndUpdate(projectVideoId, {
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
      removedData : { alt : isValidProjectVideo?.alt , info : isValidProjectVideo?.info , description : isValidProjectVideo?.description } ,
      updatedData : updatedProjectImageInfoData
   }, "Project Video Data Updated Successfully")
 )  
});

const deleteProjectVideo = asyncHandler(async (req, res) => {
  const projectVideoId = req.params.id

  if(!projectVideoId) {
    throw new ApiError(400, "Project Video Id Is Required")
  }

  const isValidProjectVideo = await ProjectVideo.findById(projectVideoId);

  if(!isValidProjectVideo) {
    throw new ApiError(404, "Project Video Not Found ! Plese Provide a Valid Id")
  }

  const removedProjectVideo = await removeFromCloudinary(isValidProjectVideo?.url , "video");
  
  if(!removedProjectVideo) {
    console.log("Unable to Remove Video From Cloudinary" ,isValidProjectVideo?.url );
  }

  const deleteProjectVideo = await ProjectVideo.findByIdAndDelete(projectVideoId);

  return res
 .status(200)
 .json(
   new ApiResponse( 200, removedProjectVideo ?  {data : deleteProjectVideo } : 
    {
      removeImage :  {
        oldimage : isValidProjectVideo?.url,
        message : "Please Delete the Old Video From Cloudinary"
      },
      data : deleteProjectVideo,
   }, "Project Image Deleted Successfully")
 )  
});


export {
  addProjectVideo,
  updateProjectVideo,
  updateProjectVideoInfo,
  deleteProjectVideo,
}

