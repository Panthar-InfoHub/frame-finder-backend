import cookieParser from "cookie-parser"
import * as cors from "cors"
import dotenv from "dotenv"
import express from "express"
import morgan from "morgan"
import { connectDB } from "./lib/ConnectDB.js"
import AppError from "./middlwares/Error.js"
import { errorHandler } from "./middlwares/ErrorMiddleware.js"
import { accessoriesRouter } from "./routes/accessories-route.js"
import { adminRoutes } from "./routes/admin-routes.js"
import { authRouter } from "./routes/auth-routes.js"
import { contactLensRouter } from "./routes/contact-lens-route.js"
import { dataRouter } from "./routes/data-routes.js"
import { lensPackageRouter } from "./routes/lens-package-routes.js"
import { miscRouter } from "./routes/misc-routes.js"
import { orderRouter } from "./routes/order-routes.js"
import { productRouter } from "./routes/product-routes.js"
import { sunglassLensPackageRouter } from "./routes/sunglass-package-routes.js"
import { sunglassRouter } from "./routes/sunglass-routes.js"
import { vendorAnalyticRouter } from "./routes/vendor-analytics-route.js"
import { vendorMiscRouter } from "./routes/vendor-misc-routes.js"
import { vendorRouter } from "./routes/vendor-routes.js"
import { wishlistRouter } from "./routes/wishlist-routes.js"
import { readerRouter } from "./routes/reader-route.js"
import { clrContactLensRouter } from "./routes/color-contact-lens-route.js"
import { userRouter } from "./routes/user-routes.js"
import { couponRouter } from "./routes/coupon-routes.js"
import { lensSolutionRouter } from "./routes/lens-solution-route.js"

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
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/vendor", vendorRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/vendor-misc", vendorMiscRouter);

//Order Routes
app.use("/api/v1/coupon", couponRouter);
app.use("/api/v1/order", orderRouter);

//Products Api Routes
app.use("/api/v1/products", productRouter);
app.use("/api/v1/sunglass", sunglassRouter);
app.use("/api/v1/reader", readerRouter);
app.use("/api/v1/contact-lens", contactLensRouter);
app.use("/api/v1/accessories", accessoriesRouter);
app.use("/api/v1/lens-package", lensPackageRouter);
app.use("/api/v1/lens-solution", lensSolutionRouter);
app.use("/api/v1/color-contact-lens", clrContactLensRouter);
app.use("/api/v1/sun-lens-package", sunglassLensPackageRouter);

//Analytics
app.use("/api/v1/vendor-analytics", vendorAnalyticRouter);



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
// this is only to test the pull request
app.listen(PORT, () => {
    console.log(`\nBackend server is started... \n PORT ==> ${PORT}`)
})