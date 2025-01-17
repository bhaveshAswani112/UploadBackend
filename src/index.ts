import app from "./app.js"
import { initializeRedisClient } from "./redisClient.js"




app.listen(4000, async () => {
    await initializeRedisClient()
    console.log("App is listening on port 4000")
})