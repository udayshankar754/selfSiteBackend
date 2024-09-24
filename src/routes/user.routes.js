import { Router } from "express";
import { 
    addProjectIDs,
    changeCurrentPassword, 
    getCurrentUser, 
    loginUser, 
    logoutUser,
    refreshAccessToken, 
    registerUser, 
    removeProjectIDs, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage ,
} from "../controllers/user.controllers.js";
import { upload } from '../middlewares/multer.middlewares.js';
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        { name : "avatar", maxCount : 1},
        { name : "coverImage", maxCount : 1}
    ]),
    registerUser
)
router.route("/login").post(loginUser)

//secrured Routes
router.route("/logout").get(verifyJWT, logoutUser)
router.route("/refresh-token").get(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT , getCurrentUser)
router.route("/update-account-details").patch(verifyJWT , updateAccountDetails)

router.route("/avatar").patch(verifyJWT , upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT , upload.single("coverImage"), updateUserCoverImage)
router.route("/add-projects").post(verifyJWT ,addProjectIDs)
router.route("/remove-projects").post(verifyJWT ,removeProjectIDs);

export default router