import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addProjects, addProjectVideoAndImage, addSocialConnect, deleteProjects, deleteSocialConnect, editProjects, editProjectVideoAndImage, getAllProjects, getProjectById, updateSocialConnect } from '../controllers/project.controllers.js';
import { upload } from '../middlewares/multer.middlewares.js';

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/add-projects").post(upload.single("clientImage") , addProjects)
router.route("/edit-projects/:id").post(upload.single("clientImage") , editProjects);
router.route("/add-project-assets/:id").patch(addProjectVideoAndImage)
router.route("/remove-project-assets/:id").patch(editProjectVideoAndImage);
router.route("/add-social-connect/:id").patch(addSocialConnect);
router.route("/edit-social-connect/:id/:socialConnectId").patch(updateSocialConnect);
router.route("/delete-social-connect/:id/:socialConnectId").delete(deleteSocialConnect);
router.route("/delete-projects/:id").delete(deleteProjects);
router.route("/get-project/:id").get(getProjectById);
router.route("/get-all-projects").get(getAllProjects);

export default router