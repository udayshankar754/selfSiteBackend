import mongoose from "mongoose";
import { About } from "../models/about.models.js";
import { WhyUs } from "../models/whyUs.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"

const addAboutUs = asyncHandler(async (req, res) => {
  const { about , whyUsId } = req.body;
  
  if(!about) {
    throw new ApiError(400 ,"About Us is required");
  }

  const whyUsIdData = Array.isArray(whyUsId) ? whyUsId : [whyUsId];

  const whyUsImagesId = await Promise.all(whyUsIdData.map(async (id) => {
    const whyUsImage = await WhyUs.findById(id);
    if(!whyUsImage) {
      throw new ApiError(404, `Why Us Image with id ${id} not found`);
    }
    return whyUsImage._id;
  }));

  const aboutUs = await About.create({
    about,
    whyUsImagesId 
  })

  return res.status(201).json(new ApiResponse(201, aboutUs, "About Us added successfully"));    
})

const updateAboutUs = asyncHandler (async (req , res) => {
  const { id } = req.params;
  const { about } = req.body;
  
  if(!about) {
    throw new ApiError(400, "About Us is required");
  }

  const isValidId = await About.findById(id);

  if(!isValidId) {
    throw new ApiError(404, `About Us with id ${id} not found`);
  }
  
  const aboutUsData = await About.findByIdAndUpdate(id, { about }, { new: true });

  return res.status(200).json(
    new ApiResponse(200, {
      previousData : isValidId?.about,
      updatedData : aboutUsData,
    }, "About Us updated successfully")
  );
})

const deleteAboutUs = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const isValidId = await About.findById(id);

  if(!isValidId) {
    throw new ApiError(404, `About Us with id ${id} not found`);
  }  
  
  await About.findByIdAndDelete(id);

  return res.status(200).json(new ApiResponse(200, null, "About Us deleted successfully"));
});

const addWhyUsImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const isValidId = await About.findById(id);

  if(!isValidId) {
    throw new ApiError(404, `About Us with id ${id} not found`);
  }

  const { whyUsId } = req.body;

  if(! whyUsId) {
    throw new ApiError(400, "Why Us Id is Required")
  }

  const whyUsIDs = [...new Set(Array.isArray(whyUsId) ? whyUsId : [whyUsId])];
  const whyUsObjectIdArray = whyUsIDs.map(id => new mongoose.Types.ObjectId(id.trim()));
  const validWhyUs = await WhyUs.find({ _id: { $in: whyUsObjectIdArray } });

  const invalidWhyUsData = whyUsObjectIdArray.filter(testId =>
      !validWhyUs.some(item => item._id.equals(testId))
  );

  if (invalidWhyUsData.length > 0) {
      throw new ApiError(400, `Invalid Why Us IDs: ${invalidWhyUsData.join(', ')}`);
  }

  const combinedWhyUsIDs = [
      ...isValidId?.whyUsImagesId?.map(id => id.toString()), // Convert to string
      ...validWhyUs.map(vid => vid._id.toString()) // Ensure they are strings too
  ];
  const finalWhyUsIDs = [...new Set(combinedWhyUsIDs)];

  const updatedAbout = await About.findByIdAndUpdate(id, {
    whyUsImagesId: finalWhyUsIDs.map(id => new mongoose.Types.ObjectId(id)), // Convert back to ObjectId if necessary
  }, { new: true })


  return  res.status(200).json(
    new ApiResponse(200 , updatedAbout , "Project Added successfully")
  );
});

const removeWhyUsImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const isValidId = await About.findById(id);

  if(!isValidId) {
    throw new ApiError(404, `About Us with id ${id} not found`);
  }

  const { whyUsId } = req.body;

  if(! whyUsId) {
    throw new ApiError(400, "Why Us is Required")
  }

  const whyUsIDs = [...new Set(Array.isArray(whyUsId) ? whyUsId : [whyUsId])];
  const whyUsObjectIdArray = whyUsIDs.map(id => new mongoose.Types.ObjectId(id.trim()));

  const notInWhyUsIds = whyUsObjectIdArray.filter(projectId =>
      !isValidId?.whyUsImagesId?.some(existingId => existingId.equals(projectId))
  );

  if(notInWhyUsIds.length > 0) {
      throw new ApiError(400, `Invalid Why Us IDs: ${notInWhyUsIds.join(', ')}`);
  }

  const finalIds = isValidId?.whyUsImagesId?.filter(existingId =>
      !whyUsObjectIdArray.some(reqId => reqId.equals(existingId))
  );

  const UpdateAbout = await About.findByIdAndUpdate(id , {
      whyUsImagesId: finalIds.map(id => new mongoose.Types.ObjectId(id)),
  },
  { new: true }  
  );

  return res.status(200).json(
      new ApiResponse(200 , UpdateAbout, "Why Us Updated successfully")
  );
});

export {
  addAboutUs, 
  updateAboutUs,
  deleteAboutUs,
  addWhyUsImage,
  removeWhyUsImage,
}