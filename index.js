const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./db/connectDB');
const eventRoutes = require('./routes/event.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/events', eventRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
