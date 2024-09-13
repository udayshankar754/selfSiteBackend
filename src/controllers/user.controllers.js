import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import  { User } from "../models/user.models.js";
import { removeFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { options } from "../utils/common.js";

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
    
   const { fullName , role, tags , mobNo , email , password } = req.body;

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
   

   const user =await User.create({
    fullName,
    role,
    tags,
    mobNo,
    email,    
    avatar : avatar !== '' ? avatar?.url  : avatar,
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
    const { email ,fullName } = req.body
    if(!(email || fullName)) {
        throw new ApiError(400, "Please fill all the fields")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
       {
            $set : {
                email,
                fullName,
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

const forgotPassword = asyncHandler( async (req , res) => {
    const { email } = req.body;
    
    if(!email) {
        throw new ApiError(400, "Please enter your email")
    }

    const user = await User.findOne({ email })
    
    if(!user) {
        throw new ApiError(404, "Please Enter a Valid Mail Address")
    }

    const resetToken = await user.generateResetToken();

    if(resetToken) {
        throw new ApiError(402 , "Invalid Reset Token")
    }

    const sendMsg = await mailSender(resetToken , email)

    return res
   .status(200)
   .json(
        new ApiResponse(200 , resetToken  , "reser Token sended successfully")
    )
})



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
    forgotPassword
}