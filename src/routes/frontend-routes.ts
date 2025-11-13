import { Router } from "express";
import FrontendController from "../controllers/frontend-controller.js";

export const frontend_router = Router();
const frontendController = new FrontendController();

frontend_router.get("/suggestion", frontendController.searchProductAndSuggestion)
frontend_router.get("/global-search", frontendController.globalSuggestion)
