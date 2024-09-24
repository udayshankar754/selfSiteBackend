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

const addWhyUsImage = asyncHandler(async (req, res) => {});

const removeWhyUsImage = asyncHandler(async (req, res) => {});

const getAboutUs = asyncHandler(async (req, res) => {});

export {
  addAboutUs, 
  updateAboutUs,
  deleteAboutUs
}