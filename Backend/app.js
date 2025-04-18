const express=require("express")
const ErrorMiddleware=require("./middleware/error")
const userRouter=require('./controllers/userRoutes')
const app=express()
app.use(express.json())

app.use("/user",userRouter)


app.use(ErrorMiddleware)

module.exports = { app };