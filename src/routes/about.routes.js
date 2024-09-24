import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addAboutUs, addWhyUsImage, deleteAboutUs, removeWhyUsImage, updateAboutUs } from '../controllers/about.controllers.js';

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/add-about-us").post(addAboutUs)
router.route("/edit-about-us/:id").patch(updateAboutUs);
router.route("/delete-about-us/:id").delete(deleteAboutUs);
router.route("/add-why-us-image/:id").patch(addWhyUsImage);
router.route("/edit-why-us-image/:id").patch(removeWhyUsImage)

export default router