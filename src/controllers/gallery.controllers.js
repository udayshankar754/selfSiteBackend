import { Gallery } from "../models/gallery.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { removeFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const addImages = asyncHandler(async (req, res) => {
    const { title , description } = req.body;

    const userId = req?.user?._id;

    if(!userId) {
        throw new ApiError(401, "Unauthorized To Access This Resource")
    }

  const galleryImageLocalPath = req.file?.path

  if(!galleryImageLocalPath) {
    throw new ApiError(400, "Image File Is Required")
  }

  const galleryImageLink = await uploadOnCloudinary(galleryImageLocalPath , "image" , 'gallery');

  if(!galleryImageLink) {
    throw new ApiError(500, "Failed To Upload Image")
  }

  const galleryImage = await Gallery.create({
    imageUrl : galleryImageLink?.url ? galleryImageLink?.url : "",
    title,
    description,
    userId
  })

  return res
  .status(200)
  .json(
      new ApiResponse( 200 , galleryImage , "Gallery Image Added Successfully")
  )

})

const editImagesInfo = asyncHandler(async (req, res) => {
    const { title , description } = req.body;

  if(!(title|| description)) {
    throw new ApiError(400, "Please Fill field You wnat to change")
  }

  const galleryImageId = req.params.id

  if(!galleryImageId) {
    throw new ApiError(400, "Gallery Image Id Is Required")
  }

  const isValidGalleryImage = await Gallery.findById(galleryImageId);

  if(!isValidGalleryImage) {
    throw new ApiError(404, "Gallery Image Not Found ! Plese Provide a Valid Id")
  }
  
  const updateGalleryImageInfo = await Gallery.findByIdAndUpdate(galleryImageId, {
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
      removedData : { title : isValidGalleryImage?.title , description : isValidGalleryImage?.description } ,
      updatedData : updateGalleryImageInfo
   }, "Gallery Image Data Updated Successfully")
 )  

})

const editImages = asyncHandler(async (req, res) => {
  const galleryImageLocalPath = req.file?.path

  const  galleryImageId = req.params.id

  if(!galleryImageLocalPath) {
    throw new ApiError(400, "Image File Is Required")
  }

  if(! galleryImageId) {
    throw new ApiError(400, "Gallery Image Id Is Required")
  }

  const isValidGalleryImage = await Gallery.findById( galleryImageId);

  if(!isValidGalleryImage) {
    throw new ApiError(404, "Gallery Image Not Found ! Plese Provide a Valid Id");
  }

  const galleryImage = await uploadOnCloudinary(galleryImageLocalPath , "image" , 'gallery');

  if(!galleryImage) {
    throw new ApiError(500, "Failed To Upload Image")
  }

  const removedGalleryImage = await removeFromCloudinary(isValidGalleryImage?.url , "image");
  
  if(!removedGalleryImage) {
    console.log("Unable to Remove Image From Cloudinary" ,isValidGalleryImage?.url );
  }
  
  const updateGalleryImage = await Gallery.findByIdAndUpdate(galleryImageId, {
      $set : {
        imageUrl : galleryImage?.url ? galleryImage?.url : ''
      }
    },
    { new: true }
  );

  return res
 .status(200)
 .json(
   new ApiResponse( 200, removedGalleryImage ?  { removedImage : removedGalleryImage ,updatedData : updateGalleryImage } : 
    {
      removeImage :  {
        oldImage : isValidGalleryImage?.url,
        message : "Please Delete the Old Image From Cloudinary"
      },
      updatedData : updateGalleryImage
   }, "Gallery Image Updated Successfully")
 )

})

const deleteImages = asyncHandler(async (req, res) => {
    const galleryImageId = req.params.id

  if(!galleryImageId) {
    throw new ApiError(400, "Gallery Image Id Is Required")
  }

  const isValidGalleryImage = await Gallery.findById(galleryImageId);

  if(!isValidGalleryImage) {
    throw new ApiError(404, "Gallery Image Not Found ! Plese Provide a Valid Id")
  }

  const removedGalleryImage = await removeFromCloudinary(isValidGalleryImage?.url , "image");
  
  if(!removedGalleryImage) {
    console.log("Unable to Remove Image From Cloudinary" ,isValidGalleryImage?.url );
  }

  await Gallery.findByIdAndDelete(galleryImageId);

  return res
 .status(200)
 .json(
   new ApiResponse( 200, removedGalleryImage ?  null : 
    {
      removeImage :  {
        oldimage : isValidGalleryImage?.url,
        message : "Please Delete the Old Image From Cloudinary"
      },
      data : null,
   }, "Gallery Image Deleted Successfully")
 )  

})


export {
    addImages, 
    editImages,
    editImagesInfo, 
    deleteImages,  
}