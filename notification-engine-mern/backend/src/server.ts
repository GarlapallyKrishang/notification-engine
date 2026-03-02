import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/db';
import { LaterQueueScheduler } from './schedulers/LaterQueueScheduler';

const PORT = process.env.PORT || 8080;

const startServer = async () => {
    // Connect Database
    await connectDB();

    // Start Scheduler
    LaterQueueScheduler.start();

    // Start Server
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
