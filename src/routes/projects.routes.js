import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addProjects, deleteProjects } from '../controllers/project.controllers.js';
import { upload } from '../middlewares/multer.middlewares.js';

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/add-projects").post(upload.single("clientImage") ,addProjects)
// router.route("/edit-projects").post(upload.single("clientImage") );
router.route("/delete-projects/:id").delete(deleteProjects);



export default router