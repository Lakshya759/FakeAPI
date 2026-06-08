import {Router} from "express"
import {createSchema,getSchemaById,updateSchema,deleteSchema} from "./schemas.controller.js"
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router=Router();

router.route("/create").post(verifyJWT,createSchema);
router.route("/schemas/:id").get(verifyJWT,getSchemaById);
router.route("/update/:id").put(verifyJWT,updateSchema);
router.route("/delete/:id").delete(verifyJWT,deleteSchema);

export default router
