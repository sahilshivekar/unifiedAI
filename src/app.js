import express, { application } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

import userRoutes from "./routes/user.routes.js"
import aiModelRoutes from "./routes/aiModel.routes.js"
import chatRoutes from "./routes/chat.routes.js"

app.use("/api/v1/user", userRoutes)
app.use("/api/v1/aiModel", aiModelRoutes)
app.use("/api/v1/chat", chatRoutes)

export { app }