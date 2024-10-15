import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.USERSERVICEPORT || 3001;

app.get('/api/users', (req, res) => {
    res.json({ users: [{ id: 1, name: 'John Doe' }] });
});

app.post('/api/login', (req, res) => {
    res.json({ users: [{ id: 1, name: 'John Doe' }] });
});

app.listen(PORT, () => {
    console.log(`User Service is running on port ${PORT}`);
});
