import { Router } from "express"
import authController from "../controller/auth.controller.js";


const authroutes = Router();


//  /api/auth/register
authroutes.post("/register",authController.register)

authroutes.post("/getme",authController.getme)

authroutes.post("/refreshtoken",authController.resfeshtoken)













export default authroutes
