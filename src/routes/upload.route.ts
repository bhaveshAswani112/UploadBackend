import { Router, Request, Response  } from "express";
import {z} from "zod"
import simpleGit from "simple-git";
import fs from "fs"
import path  from "path";
import { dirname } from "../constant.js";
import {redisClient} from "../redisClient.js"
import { getPaths,uploadToS3 } from "../utils.js";



const uploadRouter = Router()



const git = simpleGit()
const urlSchema = z.object({
    githubUrl: z
      .string()
      .url() 
      .regex(
        /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+(\/[A-Za-z0-9_.-]+)?$/,
        "Invalid GitHub URL"
      ),
      id: z.number()
  });





uploadRouter.post("/upload-code", async (req : Request, res : Response ) : Promise<any> => {
        try {
            const body = req.body
            const data = urlSchema.safeParse(body)
            if(!data.success) {
                return res.status(400).json({
                    message : "Invalid url"
                })
            }
            const {githubUrl,id} = data.data
            const gitId = id.toString()
            await git.clone(githubUrl,path.join(dirname,`output/${id}`))
            const paths = await getPaths(path.join(dirname,`output/${id}`))
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
            return res.status(200).json({
                message : "Repo cloned successfully.",
                id
            })
            
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message : "Error"
            })
        }
})  

export default uploadRouter

