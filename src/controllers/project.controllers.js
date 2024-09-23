import { ProjectImage } from "../models/projectImage.models.js";
import { ProjectVideo } from "../models/projectVideo.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from 'mongoose';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Project } from "../models/project.models.js";

const addProjects = asyncHandler(async (req, res) => {
  const {
    projectName,
    projectDescription,
    images,
    video,
    projectLink,
    githubLink,
    technologyUsed,
    problemStatement,
    solution,
    clientName,
    clientDescription,
    clientContactNumber,
    clientEmail,
    clientSocialConnectName,
    clientSocialConnectUrl,
    projectStatus,
    projectType,
  } = req.body;

  // Validation checks
  if (!(projectName && projectDescription && clientName)) {
    throw new ApiError(400, "Please fill all the fields");
  }

  if (!(projectLink || githubLink)) {
    throw new ApiError(400, "Project Link or Github Link is required");
  }

  if (!(images && Array.isArray(images) && images.length)) {
    throw new ApiError(400, "At least one image is required");
  }

  if (!(technologyUsed || problemStatement || solution)) {
    throw new ApiError(400, "At least one technology, problem statement, and solution is required");
  }

  if (!(clientDescription || clientContactNumber || clientEmail)) {
    throw new ApiError(400, "Please provide client details for valid checks");
  }

  if ((clientSocialConnectName && !clientSocialConnectUrl) || (!clientSocialConnectName && clientSocialConnectUrl)) {
    throw new ApiError(400, "Please provide client social connect details with name and URL properly");
  }

  // Verify Image IDs
  const imageIDs = [...new Set(Array.isArray(images) ? images : [images])];
  const imageObjectIdArray = imageIDs.map(id => new mongoose.Types.ObjectId(id.trim()));
  const validImages = await ProjectImage.find({ _id: { $in: imageObjectIdArray } });
  const invalidImageData = imageObjectIdArray.filter(testId =>
    !validImages.some(item => item._id.equals(testId))
  );
  if (validImages.length !== imageIDs.length) {
    throw new ApiError(400, `Invalid Image IDs: ${invalidImageData.join(', ')}`);
  }

  // Verify Video IDs
  const videoIDs = [...new Set(Array.isArray(video) ? video : [video])];
  const videoObjectIdArray = videoIDs.map(id => new mongoose.Types.ObjectId(id.trim()));
  const validVideos = await ProjectVideo.find({ _id: { $in: videoObjectIdArray } });
  const invalidVideoData = videoObjectIdArray.filter(testId =>
    !validVideos.some(item => item._id.equals(testId))
  );
  if (validVideos.length !== videoIDs.length) {
    throw new ApiError(400, `Invalid video IDs: ${invalidVideoData.join(', ')}`);
  }

  // Handle client image upload
  const clientImageLocalPath = req.file?.path;
  let clientImageLink;
  if (clientImageLocalPath) {
    clientImageLink = await uploadOnCloudinary(clientImageLocalPath, "image", 'client');
    if (!clientImageLink) {
      throw new ApiError(500, "Error uploading client image");
    }
  }

  // Prepare client social connect details
  let clientSocialConnect = [];
  const clientSocialConnectNameArray = Array.isArray(clientSocialConnectName) ? clientSocialConnectName : [clientSocialConnectName];
  const clientSocialConnectUrlArray = Array.isArray(clientSocialConnectUrl) ? clientSocialConnectUrl : [clientSocialConnectUrl];

  if (clientSocialConnectNameArray.length !== clientSocialConnectUrlArray.length) {
    throw new ApiError(400, "Client social connect names and URLs must have the same length");
  }

  clientSocialConnect = clientSocialConnectNameArray.map((name, index) => ({
    name,
    url: clientSocialConnectUrlArray[index],
  }));

  // Create the project
  const projectData = {
    projectName,
    projectDescription,
    images: validImages.map(img => img._id),
    video: validVideos.map(vid => vid._id),
    projectLink,
    githubLink,
    technologyUsed,
    problemStatement,
    solution,
    clientName,
    clientDescription,
    clientContactNumber,
    clientEmail,
    clientSocialConnect,
    projectStatus,
    projectType,
    clientImage: clientImageLink?.url,
  };

  const newProject = await Project.create(projectData);

  return res.status(201).json(new ApiResponse(201, newProject, "Project added successfully"));
});

const deleteProjects = asyncHandler(async (req , res) => {
    const { id } = req.params;
    const project = await Project.findById(id);
    
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    
    await Project.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, null, "Project deleted successfully"));

})

export { 
    addProjects ,
    deleteProjects
};
