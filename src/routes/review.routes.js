import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addReview } from '../controllers/review.controllers.js';

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/add-review").post(addReview)



export default router