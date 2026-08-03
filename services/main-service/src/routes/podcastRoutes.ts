import { Router } from "express";
import * as podcastController from "../controllers/podcastController";

const router = Router();

router.get("/", podcastController.searchPodcasts);
router.get("/episodes", podcastController.getPodcastEpisodes);

export default router;
