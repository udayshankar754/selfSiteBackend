import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import  { User } from "../models/user.models.js";
import { removeFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { options } from "../utils/common.js";
import { Project } from "../models/project.models.js";
import mongoose from 'mongoose';

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
      const accessToken =  user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()
      user.refreshToken = refreshToken;
      user.save({validateBeforeSave : false}); 
      return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500 , "something  Went Wrong While Generating Access Token and Refresh Token")
    }
}

const registerUser = asyncHandler( async (req ,res) => {
    
   const { fullName , role , tags , mobNo , email , password } = req.body;

   console.log(req.body);

   if(
    [ fullName , email , password].some((fields) => fields?.trim() === "")
   ) {
    throw new ApiError(400, "Please fill all the fields")
   }

   const existedUser = await User.findOne({email})

   if(existedUser) {
    throw new ApiError(409, "User already exists")
   }

   let avatarLocalPath, coverImageLocalPath;

   if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0 && req.files.avatar[0]?.path) {
       avatarLocalPath = req.files.avatar[0].path;
   }
   
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 && req.files.coverImage[0]?.path) {
       coverImageLocalPath = req.files.coverImage[0].path;
   }
      
   const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath, "image") : "";
   const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath, "image") : "";

   if(avatarLocalPath && !avatar ) {
        throw new ApiError(500, "something went wrong while uploading avatar file")
   }

    if(coverImageLocalPath && !coverImage ) {
        throw new ApiError(500, "something went wrong while uploading cover Image file")
    }

    // console.log(fullName , avatar, coverImage , role , tags , mobNo , email , avatar , coverImage , password);
   

   const user =await User.create({
    fullName,
    role,
    tags,
    mobNo,
    email,
    avatar : avatar!== '' ? avatar?.url  : avatar,
    coverImage : coverImage !== '' ? coverImage?.url  : coverImage,
    password,  
   })

   const createdUser = await User.findById(user._id).select('-password -refreshToken')

   if(! createdUser) {
    throw new ApiError(500, "Internal Server Error Try Again")
   }

   return res.status(201).json(
    new ApiResponse(200 , createdUser , "User Registered Successfully")
   )    
})

const loginUser = asyncHandler( async (req ,res) => { 

    const { email  , password } = req.body;

    if(!(password && email)) {
        throw new ApiError(400, "Please enter a username and Password")
    }
    
    const user = await User.findOne({email})

    if(!user ) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid Password")
    }

    const { accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken")

    
    return res
    .status(200)
    .cookie("accessToken", accessToken ,options)
    .cookie("refreshToken", refreshToken , options)
    .json(
        new ApiResponse(200 , {
            user : loggedInUser ,
            accessToken,
            refreshToken
        } , "User Logged In Successfully")
    )
})

const logoutUser = asyncHandler( async (req ,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset : {
                refreshToken : 1,
            }
        },
        {
            new : true
        }
    )

    const  options = {
        httpOnly : true,
        secure : true
    }

    res.user = null;

    return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(
        new ApiResponse(200 ,{}, "User Logged Out Successfully")
    )
})

const refreshAccessToken = asyncHandler(async(req, res) => {

    const incomingRefreshToken = req.cookies?.refreshToken || req?.body?.refreshToken

    if( ! incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select(" -password");
    
        if(!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        if(incomingRefreshToken != user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is Expired or used") 
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user?._id)
        return res
        .status(200)
        .cookie("accessToken", accessToken ,options)
        .cookie("refreshToken", refreshToken , options)
        .json (
            new ApiResponse(200 , {
                user : user ,
                accessToken,
                refreshToken,
            } , "User Logged In Successfully")
        )
    } catch (error) {
        throw new ApiError( 401 , error?.message || "Invalid Refresh Token")
    }
})

const changeCurrentPassword = asyncHandler( async(req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect) {
        throw new ApiError(401, "Invalid Old Password")
    }

    user.password = newPassword;

    await user.save({validateBeforeSave : false});

    return res
   .status(200)
   .json(
        new ApiResponse(200 , {}, "Password Changed Successfully")
    )
})

const getCurrentUser = asyncHandler(async(req ,res) => {
    return res
   .status(200)
   .json(
        new ApiResponse(200 , req.user , "User Fetched Successfully")
    )
})

const updateAccountDetails = asyncHandler(async(req ,res) => {
    const { mobNo ,fullName , role , tags} = req.body
    
    if(!(mobNo || fullName || role || tags)) {
        throw new ApiError(400, "Please fill the fields you want to update")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
       {
            $set : {
                fullName,
                role,
                tags,
                mobNo,
            }
       },
        {
            new : true
        }
    ).select( "-password -refreshToken" )

    res.user = user;

    return res
   .status(200)
   .json(
        new ApiResponse(200 , user , "Account Details Updated Successfully")
    )
})

const updateUserAvatar = asyncHandler(async(req ,res) => { 
    const avatarLocalPath = req.file?.path

    if(! avatarLocalPath ) {
        throw new ApiError(400, "Avatar file is Required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath , "image");
    if(! avatar?.url) {
        throw new ApiError(500 , "Something went wrong uploading avatar Image")
    }
    const removeAvatar = await removeFromCloudinary(req.user?.avatar , "image");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
       {
            $set : {
                avatar : avatar?.url
            }
       },
        {
            new : true
        }
    ).select(" -password -refreshToken")
    req.user = user;

    return res
   .status(200)
   .json(
        new ApiResponse(200 , {RemoveAvatar : removeAvatar , user } , "Avatar Updated Successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req ,res) => {
    const coverImageLocalPath = req.file?.path
    if(! coverImageLocalPath ) {
        throw new ApiError(400, "Cover Image file is Required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath , "image");
    if(! coverImage?.url) {
        throw new ApiError(500 , "Something went wrong uploading Cover Image")
    }
 
    const removeCoverImage = await removeFromCloudinary(req.user?.coverImage , "image");

    const user = await User.findByIdAndUpdate(
        req.user._id,
       {
            $set : {
                coverImage : coverImage?.url
            }
       },
        {
            new : true
        }
    ).select(" -password -refreshToken")

    req.user = user;

    return res
   .status(200)
   .json(
        new ApiResponse(200 , {RemoveCoverImage : removeCoverImage , user }  , "Cover Image Updated Successfully")
    )
})

const addProjectIDs = asyncHandler (async (req, res) => {

    const { projectId } = req.body;

    const userId = req.user?._id;

    const existingProject = req.user?.projectId ? req.user.projectId : [];

    if(!userId) {
        throw new ApiError(401, "Unauthorized Request")
    }

    if(! projectId) {
        throw new ApiError(400, "Project ID is Required")
    }

    const projectIDs = [...new Set(Array.isArray(projectId) ? projectId : [projectId])];
    const projectObjectIdArray = projectIDs.map(id => new mongoose.Types.ObjectId(id.trim()));
    const validProjects = await Project.find({ _id: { $in: projectObjectIdArray } });

    const invalidProjectData = projectObjectIdArray.filter(testId =>
        !validProjects.some(item => item._id.equals(testId))
    );

    if (invalidProjectData.length > 0) {
        throw new ApiError(400, `Invalid Project IDs: ${invalidProjectData.join(', ')}`);
    }

    const combinedProjectIDs = [
        ...existingProject?.map(id => id.toString()), // Convert to string
        ...validProjects.map(vid => vid._id.toString()) // Ensure they are strings too
    ];
    const finalProjectIds = [...new Set(combinedProjectIDs)];

    const updatedProject = await User.findByIdAndUpdate(userId, {
        projectId: finalProjectIds.map(id => new mongoose.Types.ObjectId(id)), // Convert back to ObjectId if necessary
    }, { new: true }).select('-password -refreshToken');

    req.user = updatedProject;

    return  res.status(200).json(
        new ApiResponse(200 , updatedProject , "Project Added successfully")
    );

})

const removeProjectIDs = asyncHandler(async (req, res) => {
    const { projectId } = req.body;

    const userId = req.user?._id;

    const existingProject = req.user?.projectId ? req.user.projectId : [];

    if(!userId) {
        throw new ApiError(401, "Unauthorized Request")
    }

    if(! projectId) {
        throw new ApiError(400, "Project ID is Required")
    }

    const projectIDs = [...new Set(Array.isArray(projectId) ? projectId : [projectId])];
    const projectObjectIdArray = projectIDs.map(id => new mongoose.Types.ObjectId(id.trim()));

    const notInProjectIds = projectObjectIdArray.filter(projectId =>
        !existingProject.some(existingId => existingId.equals(projectId))
    );

    if(notInProjectIds.length > 0) {
        throw new ApiError(400, `User does not contain the following Project IDs: ${notInProjectIds.join(', ')}`);
    }

    const finalIds = existingProject.filter(existingId =>
        !projectObjectIdArray.some(reqId => reqId.equals(existingId))
    );

    const UpdateUser = await User.findByIdAndUpdate(userId , {
        projectId: finalIds.map(id => new mongoose.Types.ObjectId(id)),
    },
    { new: true }  
    ).select('-password -refreshToken');

    return res.status(200).json(
        new ApiResponse(200 , UpdateUser, "Project Updated successfully")
    );
});




export { 
    registerUser ,
    loginUser ,
    logoutUser ,
    refreshAccessToken  , 
    changeCurrentPassword ,
    getCurrentUser, 
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    addProjectIDs,
    removeProjectIDs
}