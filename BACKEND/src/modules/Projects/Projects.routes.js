import {Router} from "express";
import {verifyJWT} from "../../middlewares/auth.middleware.js"
import {createProject,deleteProject} from "./Projects.controller.js"

const router=Router();

router.route("/create").post(verifyJWT,createProject)
router.route("/delete/:id").get(verifyJWT,deleteProject)

export default router;