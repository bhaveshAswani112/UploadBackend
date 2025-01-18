import express, {Request, Response} from "express";
import cors from "cors";
import uploadRouter from "./routes/upload.route.js";
import simpleGit from "simple-git";
import path  from "path";
import {dirname} from "./constant.js"
import fs from "fs"
import { getPaths, uploadToS3 } from "./utils.js";
import { redisClient } from "./redisClient.js";


const app = express()
app.use(express.json())



const git = simpleGit()



app.post("/webhook",cors({ 
  origin: '*', 
  methods: ['POST'],
  allowedHeaders: ['Authorization', 'Content-Type']
}),express.json({type: 'application/json'}), async (req,res) : Promise<any> => {
    try {
      const githubEvent = req.headers['x-github-event'];
      // console.log(githubEvent)
      // console.log(req.body)
      console.log(req)
      if(githubEvent==="push") {
          const id = req.body.repository.id
          const gitId = id.toString()
          const githubUrl = req.body.clone_url
          await git.clone(githubUrl,path.join(dirname,`output/${gitId}`))
          const paths = await getPaths(path.join(dirname,`output/${gitId}`))
          for(const file of paths) {
              const fileName = file.replace(dirname, "").replace(/\\/g, "/").startsWith("/") ? file.replace(dirname, "").replace(/\\/g, "/").substring(1) : file.replace(dirname, "").replace(/\\/g, "/")
              // console.log(fileName)
              await uploadToS3(fileName,file)
          }
          
          fs.promises.rm(path.join(dirname, `output/${id}`), { 
              recursive: true, 
              force: true 
          }).catch(err => console.error('Error removing directory:', err))
          redisClient.lPush("build-queue", gitId )
          redisClient.hSet("status",gitId , "uploaded")
      }
      return res.status(200).json({})
    } catch (error) {
      console.log("Error in repo")
      console.log(error)
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