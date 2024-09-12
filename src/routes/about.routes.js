import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addAboutUs } from '../controllers/about.controllers.js';

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/add-about-us").post(addAboutUs)


export default router