import express from "express"
import dotenv from "dotenv"
import * as cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import { connectDB } from "./lib/ConnectDB.js"
import { vendorRequestRoutes } from "./routes/vendor_request.js"
import { adminRoutes } from "./routes/admin-routes.js"
import { vendorRouter } from "./routes/vendor-routes.js"
import { categoryRouter } from "./routes/category-routes.js"
import { productRouter } from "./routes/product-routes.js"

//Configurations
const app = express()
dotenv.config()

//Middlewares

app.use(cors.default())
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
if (process.env.ENVIROMENT === "dev") {
    app.use(morgan('combined')); //For logging
}

//API ROUTES 
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/vendor", vendorRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/vendor-request", vendorRequestRoutes);
//Error middlware
const PORT = process.env.PORT || 8080

connectDB()
app.listen(PORT, () => {
    console.log(`\nBackend server is started... \n PORT ==> ${PORT}`)
})