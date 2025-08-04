import express from "express"
import dotenv from "dotenv"
import * as cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import { connectDB } from "./lib/ConnectDB.js"

//Configurations
const app = express()
dotenv.config()

//Middlewares

app.use(cors.default())
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined')); //For logging

//API ROUTES 

//Error middlware
const PORT = process.env.PORT || 8080

connectDB()
app.listen(PORT, () => {
    console.log(`\nBackend server is started... \n PORT ==> ${PORT}`)
})