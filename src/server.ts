import cookieParser from "cookie-parser"
import * as cors from "cors"
import dotenv from "dotenv"
import express from "express"
import morgan from "morgan"
import { connectDB } from "./lib/ConnectDB.js"
import { adminRoutes } from "./routes/admin-routes.js"
import { categoryRouter } from "./routes/category-routes.js"
import { dataRouter } from "./routes/data-routes.js"
import { miscRouter } from "./routes/misc-routes.js"
import { productRouter } from "./routes/product-routes.js"
import { vendorMiscRouter } from "./routes/vendor-misc-routes.js"
import { vendorRouter } from "./routes/vendor-routes.js"
import { vendorRequestRoutes } from "./routes/vendor_request.js"
import { wishlistRouter } from "./routes/wishlist-routes.js"
import { sunglassRouter } from "./routes/sunglass-routes.js"
import { lensPackageRouter } from "./routes/lens-package-routes.js"
import { authRouter } from "./routes/auth-routes.js"
import { sunglassLensPackageRouter } from "./routes/sunglass-package-routes.js"
import { errorHandler } from "./middlwares/ErrorMiddleware.js"
import AppError from "./middlwares/Error.js"

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
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/misc", miscRouter);
app.use("/api/v1/data", dataRouter);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/vendor", vendorRouter);
app.use("/api/v1/vendor-misc", vendorMiscRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/vendor-request", vendorRequestRoutes);

//Products Api Routes
app.use("/api/v1/products", productRouter);
app.use("/api/v1/sunglass", sunglassRouter);
app.use("/api/v1/lens-package", lensPackageRouter);
app.use("/api/v1/sun-lens-package", sunglassLensPackageRouter);
//Error middlware
const PORT = process.env.PORT || 8080

//Health check
app.get("/ping", (req, res) => {
    res.status(200).send({ message: "server is running....." })
})

app.get("/test-error", (req, res) => {
    throw new AppError("this is a test error", 500);
    // res.status(200).send({ message: "server is running....." })
})

app.use(errorHandler)

connectDB()
app.listen(PORT, () => {
    console.log(`\nBackend server is started... \n PORT ==> ${PORT}`)
})