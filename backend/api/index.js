import app from "../src/app.js";
import { connectToDatabase } from "../src/config/database.js";
export default async function handler(req, res) {
    try {
        await connectToDatabase();
        return app(req, res);
    }
    catch (error) {
        console.error("[Vercel Serverless Function Error]:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error connecting to database.",
            code: "DATABASE_CONNECTION_ERROR",
        });
    }
}
