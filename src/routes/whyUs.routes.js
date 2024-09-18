import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addWhyUs,  deleteWhyUs, updateWhyUsDetails, updateWhyUsImage } from '../controllers/whyUs.controllers.js';
import { upload } from '../middlewares/multer.middlewares.js';

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/add-why-us-image").post(upload.single("avatar") ,addWhyUs)
router.route("/update-why-us-image/:id").patch(upload.single("avatar") ,updateWhyUsImage)
router.route("/update-why-us-details/:id").patch(updateWhyUsDetails)
router.route("/delete-why-us/:id").delete(deleteWhyUs);

export default router