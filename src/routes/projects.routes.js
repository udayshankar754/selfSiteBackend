import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
// router.route("/:type/:id").get(getAllComments).post(addComment);


export default router