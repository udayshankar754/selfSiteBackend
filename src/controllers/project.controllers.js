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

const editProjects = asyncHandler(async (req , res) => {
    const { id } = req.params;
    const project = await Project.findById(id);
    
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const {
        projectName,
        projectDescription,
        projectLink,
        githubLink,
        technologyUsed,
        problemStatement,
        solution,
        clientName,
        clientDescription,
        clientContactNumber,
        clientEmail,
        projectStatus,
        projectType,
    } = req.body;

    
  // Validation checks
  if (!(
    projectName || projectDescription || projectLink || githubLink || technologyUsed || problemStatement || solution || clientName || clientDescription || clientContactNumber || clientEmail  || projectStatus || projectType
  )) {
    throw new ApiError(400, "Please fill field you want to change");
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

  
  const updatedProjectData = await Project.findByIdAndUpdate(id , {
    $set: {
        projectName,
        projectDescription,
        projectLink,
        githubLink,
        technologyUsed,
        problemStatement,
        solution,
        clientName,
        clientDescription,
        clientContactNumber,
        clientEmail,
        projectStatus,
        projectType,
        clientImage: clientImageLink?.url,
    },
  },
  { new: true }
  )

  return res.status(201).json(new ApiResponse(201, updatedProjectData, "Project Updated successfully"));
})

const addProjectVideoAndImage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const project = await Project.findById(id);
    
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    
    const { video, images } = req.body;

    if (!(video || images)) {
        throw new ApiError(400, "Please provide fields you want to add");
    }

    let validVideos = [], validImages = [];

    // Validate Video IDs
    if (video) {
        const videoIDs = [...new Set(Array.isArray(video) ? video : [video])];
        const videoObjectIdArray = videoIDs.map(id => new mongoose.Types.ObjectId(id.trim()));
        validVideos = await ProjectVideo.find({ _id: { $in: videoObjectIdArray } });

        const invalidVideoData = videoObjectIdArray.filter(testId =>
            !validVideos.some(item => item._id.equals(testId))
        );

        if (invalidVideoData.length > 0) {
            throw new ApiError(400, `Invalid video IDs: ${invalidVideoData.join(', ')}`);
        }
    }

    // Validate Image IDs
    if (images) {
        const imageIDs = [...new Set(Array.isArray(images) ? images : [images])];
        const imageObjectIdArray = imageIDs.map(id => new mongoose.Types.ObjectId(id.trim()));
        validImages = await ProjectImage.find({ _id: { $in: imageObjectIdArray } });

        const invalidImageData = imageObjectIdArray.filter(testId =>
            !validImages.some(item => item._id.equals(testId))
        );

        if (invalidImageData.length > 0) {
            throw new ApiError(400, `Invalid image IDs: ${invalidImageData.join(', ')}`);
        }
    }

    // Combine existing and new video IDs
    const combinedVideoIDs = [
        ...project.video.map(id => id.toString()), // Convert to string
        ...validVideos.map(vid => vid._id.toString()) // Ensure they are strings too
    ];
    const finalVideo = [...new Set(combinedVideoIDs)];

    // Combine existing and new image IDs
    const combinedImageIDs = [
        ...project.images.map(id => id.toString()), // Convert to string
        ...validImages.map(img => img._id.toString()) // Ensure they are strings too
    ];
    const finalImage = [...new Set(combinedImageIDs)];


    const updatedProject = await Project.findByIdAndUpdate(id, {
        video: finalVideo.map(id => new mongoose.Types.ObjectId(id)), // Convert back to ObjectId if necessary
        images: finalImage.map(id => new mongoose.Types.ObjectId(id)), // Convert back to ObjectId if necessary
    }, { new: true });

    return res.status(200).json(new ApiResponse(200, updatedProject, "Project updated successfully"));
});

const editProjectVideoAndImage = asyncHandler(async (req , res) => {
    const { id } = req.params;

    const project = await Project.findById(id);
    
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    
    const { video, images } = req.body;

    if (!(video || images)) {
        throw new ApiError(400, "Please provide fields you want to add");
    }

    let finalVideo = [], finalImage = [];

    // Validate Video IDs
    if (video) {
        const videoIDs = [...new Set(Array.isArray(video) ? video : [video])];
        const videoObjectIdArray = videoIDs.map(id => new mongoose.Types.ObjectId(id.trim()));

        // Ensure project?.video is an array of ObjectIds
        const projectVideoIds = project?.video || [];

        // Find video IDs that are not in project.video
        const notInProjectVideo = videoObjectIdArray.filter(videoId =>
            !projectVideoIds.some(existingId => existingId.equals(videoId))
        );

        if(notInProjectVideo.length > 0) {
            throw new ApiError(400, `Project does not contain the following video IDs: ${notInProjectVideo.join(', ')}`);
        }

         // Populate finalVideo with IDs from project that are NOT in the request
        finalVideo = projectVideoIds.filter(existingId =>
            !videoObjectIdArray.some(reqId => reqId.equals(existingId))
        );
    }

    // Validate Image IDs
     if (images) {
        const imageIDs = [...new Set(Array.isArray(images) ? images : [images])];
        const imageObjectIdArray = imageIDs.map(id => new mongoose.Types.ObjectId(id.trim()));

        const projectImageId = project?.images || [];

        const notInProjectImage = imageObjectIdArray.filter(imageId =>
            !projectImageId.some(existingId => existingId.equals(imageId))
        );

        if(notInProjectImage.length > 0) {
            throw new ApiError(400, `Project does not contain the following Image IDs: ${notInProjectImage.join(', ')}`);
        }

         // Populate finalImage with IDs from project that are NOT in the request
        finalImage = projectImageId.filter(existingId =>
            !imageObjectIdArray.some(reqId => reqId.equals(existingId))
        );
    }



    const updatedProject = await Project.findByIdAndUpdate(id, {
        video: finalVideo, 
        images: finalImage, 
    }, { new: true });

    return res.status(200).json(new ApiResponse(200, updatedProject , "Project Image or Video updated successfully"));
})

const addSocialConnect = asyncHandler (async (req , res) => {
    const { id } = req.params;
    const { clientSocialConnect } = req.body; // Get clientSocialConnect from request body

    // Find the project by ID
    const project = await Project.findById(id);
    
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    let newSocialConnects = [];

    // Update social connections if provided
    if (clientSocialConnect) {
        // Ensure clientSocialConnect is an array
        const socialConnects = Array.isArray(clientSocialConnect) ? clientSocialConnect : [clientSocialConnect];

        // Validate and add new social connections
        newSocialConnects = socialConnects.map(connect => {
            // Check if both name and url are present
            if (!connect.name || !connect.url) {
                throw new ApiError(400, "Each social connection must have both a name and a URL");
            }

            return {
                name: connect.name,
                url: connect.url
            };
        });
    }

    // Save the updated project
    const updatedProject = await Project.findByIdAndUpdate(id , {
        clientSocialConnect: [...project?.clientSocialConnect,...newSocialConnects]
    }, { new : true});

    return res.status(200).json(new ApiResponse(200, updatedProject, "Social connection Added successfully"));
})

const updateSocialConnect = asyncHandler(async (req, res) => {
    const { id, socialConnectId } = req.params;
    const { clientSocialConnect } = req.body; 

    // Find the project by ID
    const project = await Project.findById(id);
    
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Find the specific social connect to update
    const socialConnectIndex = project?.clientSocialConnect?.findIndex(connect => 
        connect?._id?.equals(socialConnectId)
    );

    if (socialConnectIndex === -1) {
        throw new ApiError(404, "Social connection not found");
    }

    // Validate and update the social connection
    if (clientSocialConnect) {
        const { name, url } = clientSocialConnect;

        // Check if both name and url are present
        if (!name || !url) {
            throw new ApiError(400, "Social connection must have both a name and a URL");
        }

        // Update the social connection
        project.clientSocialConnect[socialConnectIndex] = {
            ...project.clientSocialConnect[socialConnectIndex],
            name,
            url
        };
    }

    // Save the updated project
    const updatedProject = await project.save();

    return res.status(200).json(new ApiResponse(200, updatedProject, "Social connection updated successfully"));
});

const deleteSocialConnect = asyncHandler(async (req, res) => {
    const { id, socialConnectId } = req.params;
    const project = await Project.findById(id);
    
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    
    const socialConnectIndex = project?.clientSocialConnect?.findIndex(connect => 
        connect?._id?.equals(socialConnectId)
    );
    
    if (socialConnectIndex === -1) {
        throw new ApiError(404, "Social connection not found");
    }

    project.clientSocialConnect.splice(socialConnectIndex, 1);
    
    await project.save();
    
    return res.status(200).json(new ApiResponse(200, project, "Social connection deleted successfully"));
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

const getProjectById = asyncHandler(async (req , res) => {
    const { id } = req.params;
    const project = await Project.findById(id);
    
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    
    return res.status(200).json(new ApiResponse(200, project, "Project fetched successfully"));    
})

const getAllProjects = asyncHandler(async (req , res) => {
   
    const project = await Project.find({});
    
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    
    return res.status(200).json(new ApiResponse(200, project, "Projects fetched successfully"));    
})

export { 
    addProjects ,
    editProjects, 
    deleteProjects,
    getProjectById,
    getAllProjects,
    addProjectVideoAndImage,
    editProjectVideoAndImage,
    addSocialConnect,
    updateSocialConnect,
    deleteSocialConnect,
};
