const express = require("express");
const ErrorMiddleware = require("./middleware/error");
const userRouter = require('./controllers/userRoutes');
const cookieParser = require('cookie-parser'); // ✅ ADD THIS
const cors = require("cors");
const path = require('path');

const app = express();

app.use(express.json());
app.use(cookieParser()); // ✅ USE THIS
require('./config/passport');

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use("/user", userRouter);
app.use('/profile-photo', express.static(path.join(__dirname, 'upload')));
app.use(ErrorMiddleware);

module.exports = { app };
