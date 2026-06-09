import { Router } from "express";

import {getMockData} from "../Mock_Engine/mock.controller.js";

const router = Router();

router.get("/:projectSlug/:endpointName",getMockData);
router.get("/test", (req, res) => {
    res.send("Mock route working");
});
export default router;