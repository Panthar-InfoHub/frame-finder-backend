import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string , {
            dbName: "framedb"
        })

        console.debug("Database connected....")
    } catch (error) {
        console.error("Error while connecting to database ==> ",error)
    }
}