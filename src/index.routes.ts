import { Express } from "express"

import { accessoriesRouter } from "./routes/accessories-route.js"
import { adminRoutes } from "./routes/admin-routes.js"
import { authRouter } from "./routes/auth-routes.js"
import { bestSellerRouter } from "./routes/best-seller-routes.js"
import { clrContactLensRouter } from "./routes/color-contact-lens-route.js"
import { contactLensRouter } from "./routes/contact-lens-route.js"
import { couponRouter } from "./routes/coupon-routes.js"
import { dataRouter } from "./routes/data-routes.js"
import { frontend_router } from "./routes/frontend-routes.js"
import { lensPackageRouter } from "./routes/lens-package-routes.js"
import { lensSolutionRouter } from "./routes/lens-solution-route.js"
import { miscRouter } from "./routes/misc-routes.js"
import { orderRouter } from "./routes/order-routes.js"
import { productRouter } from "./routes/product-routes.js"
import { readerRouter } from "./routes/reader-route.js"
import { reviewRouter } from "./routes/review-routes.js"
import { sunglassLensPackageRouter } from "./routes/sunglass-package-routes.js"
import { sunglassRouter } from "./routes/sunglass-routes.js"
import { userRouter } from "./routes/user-routes.js"
import { vendorAnalyticRouter } from "./routes/vendor-analytics-route.js"
import { vendorMiscRouter } from "./routes/vendor-misc-routes.js"
import { vendorRouter } from "./routes/vendor-routes.js"
import { webhookRouter } from "./routes/webhook-route.js"
import { wishlistRouter } from "./routes/wishlist-routes.js"
import { user_wishlistRouter } from "./routes/user_wishlist-routes.js"
import { marketingRouter } from "./routes/marketing-routes.js"
import { cms_router } from "./routes/cms-route.js"
import { notification_router } from "./routes/notification-routes.js"

export const registerRoutes = (app: Express) => {

    // Auth & Core
    app.use("/api/v1/auth", authRouter)
    app.use("/api/v1/user", userRouter)
    app.use("/api/v1/admin", adminRoutes)

    // CMS / Frontend
    app.use("/api/v1/frontend", frontend_router)
    app.use("/api/v1/cms", cms_router)

    // Admin routes
    app.use("/api/v1/notification", notification_router)

    // Vendor
    app.use("/api/v1/vendor", vendorRouter)
    app.use("/api/v1/vendor-misc", vendorMiscRouter)
    app.use("/api/v1/vendor-analytics", vendorAnalyticRouter)

    // Orders & Reviews
    app.use("/api/v1/order", orderRouter)
    app.use("/api/v1/coupon", couponRouter)
    app.use("/api/v1/review", reviewRouter)

    // Products
    app.use("/api/v1/products", productRouter)
    app.use("/api/v1/sunglass", sunglassRouter)
    app.use("/api/v1/reader", readerRouter)
    app.use("/api/v1/contact-lens", contactLensRouter)
    app.use("/api/v1/accessories", accessoriesRouter)
    app.use("/api/v1/lens-package", lensPackageRouter)
    app.use("/api/v1/lens-solution", lensSolutionRouter)
    app.use("/api/v1/color-contact-lens", clrContactLensRouter)
    app.use("/api/v1/sun-lens-package", sunglassLensPackageRouter)

    // Misc
    app.use("/api/v1/marketing-form", marketingRouter)
    app.use("/api/v1/misc", miscRouter)
    app.use("/api/v1/data", dataRouter)
    app.use("/api/v1/cart", wishlistRouter)
    app.use("/api/v1/wishlist", user_wishlistRouter)

    // Analytics
    app.use("/api/v1/best-seller", bestSellerRouter)

    // Webhooks
    app.use("/api/v1/webhook", webhookRouter)
}
