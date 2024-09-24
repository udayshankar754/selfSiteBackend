import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addImages, deleteImages, editImages, editImagesInfo } from '../controllers/gallery.controllers.js';
import { upload } from '../middlewares/multer.middlewares.js';

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/add-image").post(upload.single('image'), addImages)
router.route("/edit-image/:id").patch(upload.single('image'),editImages)
router.route("/edit-image-info/:id").patch(editImagesInfo)
router.route("/delete-image/:id").delete(deleteImages)

export default router