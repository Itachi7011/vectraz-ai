import { Router } from "express";
import * as githubController from "../controllers/githubController";

const router = Router();
router.get("/", githubController.getTrendingRepos);
export default router;
