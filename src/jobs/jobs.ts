import cron from "node-cron"
import { bestSellerController } from "../controllers/best-seller-controller.js";

export const startCronBestSellerJob = () => {
    cron.schedule("0 0 * * *", async () => {
        try {
            await bestSellerController.calculateBestSellers();
        } catch (error) {
            console.error('error in best seller calculation:', error);
            // send alert to monitoring service (e.g., Sentry, DataDog)
        }
    });
    console.log('\nBest seller cron job scheduled: Daily at 00:00 IST');
}