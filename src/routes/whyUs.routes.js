import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addWhyUsImage, updateWhyUsDetails, updateWhyUsImage } from '../controllers/whyUs.controllers.js';

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/add-why-us-image").post(upload.single("avatar") ,addWhyUsImage)
router.route("/update-why-us-image").post(upload.single("avatar") ,updateWhyUsImage)
router.route("/update-why-us-image").post(updateWhyUsDetails)
export default router