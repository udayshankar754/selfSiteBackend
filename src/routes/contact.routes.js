import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addContacts } from '../controllers/contact.controllers.js';

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/add-contact").post(addContacts)


export default router