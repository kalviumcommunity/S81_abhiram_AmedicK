const express = require("express");
const ErrorMiddleware = require("./middleware/error");
const userRouter = require('./controllers/userRoutes');
const doctorRouter = require("./controllers/docterRoutes");
const AppointmentRouter = require("./controllers/bookAppointment");
const getAvailableSlotsRouter = require("./controllers/getAvailableSlots"); // ✅
const cookieParser = require('cookie-parser');
const cors = require("cors");
const path = require('path');

const app = express();
app.use(express.json());
app.use(cookieParser());
require('./config/passport');

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use("/appointmentsbook", AppointmentRouter);
app.use("/available", getAvailableSlotsRouter); // ✅ This line fixed your issue

app.use("/user", userRouter);
app.use("/doctor", doctorRouter);
app.use('/profile-photo', express.static(path.join(__dirname, 'upload')));
app.use(ErrorMiddleware);

module.exports = { app };
