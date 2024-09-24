import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addReview, deleteReview, editReview } from '../controllers/review.controllers.js';

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/add-review").post(addReview)
router.route("/update-review/:id").patch(editReview)
router.route("/delete-review/:id").delete(deleteReview)

export default router