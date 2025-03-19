import dotenv from "dotenv"
import { app } from "./app.js"
dotenv.config({ path: '.env' })
import https from 'https';
import sequelize from "./config/db.connection.js";
const port = process.env.PORT || 8000;


// for stoping the server instance on render to go down with inactivity
app.get("/api/v1/self-ping", async (req, res) => {
    res.status(200).send(null);
})

setInterval(() => {
    https.get(process.env.SERVER_ADDRESS + "/api/v1/self-ping", (res) => {
        console.log("Server Self-ping: ", res.statusCode)
    }).on('error', (err) => {
        console.log("Error during self-ping: ", err.message)
    })
}, 1000 * 60 * 2) //2 minutes


//for stoping the database service from going down with inactivity
setInterval(async () => {
    const users = await sequelize.query(`SELECT user_id FROM users LIMIT 1;`)
    if (users) {
        console.log("DB Self-ping: ")
    }
}, 1000 * 20) // 20 seconds

app.listen(port, () => {
    console.log(`Server is running at port: ${port}`);
});