import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addProjects } from '../controllers/project.controllers.js';

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/add-projects").post(addProjects)


export default router