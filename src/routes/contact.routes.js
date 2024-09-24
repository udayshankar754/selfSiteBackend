import { Router } from 'express';

import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { addContacts, deleteContacts, editContacts } from '../controllers/contact.controllers.js';

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/add-contact").post(addContacts)
router.route("/edit-contact/:id").patch(editContacts)
router.route("/delete-contact/:id").delete(deleteContacts)


export default router