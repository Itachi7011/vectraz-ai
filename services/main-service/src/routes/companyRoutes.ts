import { Router } from "express";
import * as companyController from "../controllers/companyController";

const router = Router();

router.get("/", companyController.listCompanies);
router.get("/:slug", companyController.getCompanyArticles);

export default router;
