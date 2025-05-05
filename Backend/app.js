const express=require("express")
const ErrorMiddleware=require("./middleware/error")
const userRouter=require('./controllers/userRoutes')
const app=express()
const cors=require("cors")
app.use(express.json())

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use("/user",userRouter)




app.use(ErrorMiddleware)

module.exports = { app };