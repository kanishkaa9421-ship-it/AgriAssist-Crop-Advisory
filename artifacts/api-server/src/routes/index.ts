import { Router, type IRouter } from "express";
import healthRouter from "./health";
import agriRouter from "./agri";

const router: IRouter = Router();

router.use(healthRouter);
router.use(agriRouter);

export default router;
