import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addAboutUs, deleteAboutUs, updateAboutUs } from '../controllers/about.controllers.js';

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/add-about-us").post(addAboutUs)
router.route("/edit-about-us/:id").patch(updateAboutUs);
router.route("/delete-about-us/:id").delete(deleteAboutUs);

export default router