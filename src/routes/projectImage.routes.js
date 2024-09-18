import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addProjectImage, deleteProjectImage, updateProjectImage, updateProjectImageInfo } from '../controllers/projectImage.controllers.js';
import { upload } from '../middlewares/multer.middlewares.js';

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/add-project-image").post(upload.single("image") ,addProjectImage)
router.route("/update-project-image/:id").patch(upload.single("image") ,updateProjectImage)
router.route("/update-project-details/:id").patch(updateProjectImageInfo)
router.route("/delete-project-image/:id").delete(deleteProjectImage);

export default router