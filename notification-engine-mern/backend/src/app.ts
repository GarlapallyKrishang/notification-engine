import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Root Hello
app.get('/', (req, res) => {
    res.send('Notification Engine API (MERN) is running.');
});

export default app;
