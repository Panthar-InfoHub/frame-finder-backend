import cookieParser from "cookie-parser"
import * as cors from "cors"
import dotenv from "dotenv"
import express from "express"
import http from "http"
import morgan from "morgan"
import { Server } from "socket.io"
import { registerRoutes } from "./index.routes.js"
import { connectDB } from "./lib/ConnectDB.js"
import logger from "./lib/logger.js"
import AppError from "./middlwares/Error.js"
import { errorHandler } from "./middlwares/ErrorMiddleware.js"


//Configurations
const app = express()
dotenv.config()
//Setting up socket server
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

//Middlewares
app.use(cors.default())
app.use(express.json());
app.set("io", io)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
if (process.env.ENVIROMENT === "dev") {
    app.use(morgan('combined')); //For logging
}

//API ROUTES 
registerRoutes(app);



//Health check
app.get("/ping", (req, res) => {
    res.status(200).send({ message: "server is running....." })
})

app.get("/test-error", (req, res) => {
    throw new AppError("this is a test error", 500);
})

//Error middlware
app.use(errorHandler)


const PORT = process.env.PORT || 8080



connectDB()
server.listen(PORT, () => {
    // startCronBestSellerJob();
    logger.debug(`\nBackend server is started... \n PORT ==> ${PORT}`)
})

process.on('SIGTERM', () => {
    logger.warn('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Process terminated');
    });
});

process.on('SIGINT', () => {
    logger.warn('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Process terminated');
    });
});
