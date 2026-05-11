import express from "express"
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authroutes from "./router/auth.routes.js";

const app = express()


app.use(express.json())
app.use(morgan("dev"));
app.use(cookieParser());


app.use("/api/auth",authroutes)


export default app