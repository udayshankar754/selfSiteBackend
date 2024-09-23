import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addProjectVideo, deleteProjectVideo, updateProjectVideo, updateProjectVideoInfo } from '../controllers/projectVideo.controllers.js';
import { upload } from '../middlewares/multer.middlewares.js';

const router = Router();


router.use(verifyJWT); 
router.route("/add-project-video").post(upload.single("video") ,addProjectVideo)
router.route("/update-project-video/:id").patch(upload.single("video") ,updateProjectVideo)
router.route("/update-project-video-details/:id").patch(updateProjectVideoInfo)
router.route("/delete-project-video/:id").delete(deleteProjectVideo);

export default router