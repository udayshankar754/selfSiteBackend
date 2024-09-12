import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addImages } from '../controllers/gallery.controllers.js';

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/add-images").post(addImages)


export default router