import express, {Request, Response} from "express"
import cors from "cors"
import uploadRouter from "./routes/upload.route.js"



const app = express()
app.use(express.json())



app.post("/webhook",cors({ 
  origin: '*', 
  methods: ['POST'],
  allowedHeaders: ['Authorization', 'Content-Type']
}),express.json({type: 'application/json'}), async (req,res) : Promise<any> => {
    try {
      const githubEvent = req.headers['x-github-event'];
      if(githubEvent==="push") {

      }
      return res.status(200).json({})
    } catch (error) {
      return res.status(200).json({})
    }
})


app.get("/health",cors({origin : "*"}),async (req : Request, res : Response) : Promise<any> => {
    return res.status(200).json({
      message : "Working fine"
    })
})

app.use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );
  

app.use("",uploadRouter)

 export default app