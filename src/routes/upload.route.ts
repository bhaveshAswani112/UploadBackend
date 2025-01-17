import { Router, Request, Response  } from "express";
import {z} from "zod"
import simpleGit from "simple-git";
import fs from "fs"
import path  from "path";
import { dirname } from "../constant.js";
import * as AWS from "aws-sdk";
import { ACCESS_KEY_ID, SECRET_ACCESS_KEY,S3_URL } from "../constant.js";
import {redisClient} from "../redisClient.js"


const uploadRouter = Router()


const s3Client = new AWS.S3({
    accessKeyId : ACCESS_KEY_ID,
    secretAccessKey : SECRET_ACCESS_KEY,
    endpoint : S3_URL,
})




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


const getPaths = async (dir : string) : Promise<string[]> => {
    try {
        const paths  = await fs.promises.readdir(dir)
        const allPaths = []
        for(const file of paths) {
            const filePath = path.resolve(dir,file)
            const stat = await fs.promises.stat(filePath)
            if(stat.isDirectory()) {
                // console.log(filePath)
                const subPaths = await getPaths(filePath)
                allPaths.push(...subPaths)
            }
            else {
                allPaths.push(filePath)
            }
        }
        // console.log(allPaths)
        return allPaths
    } catch (error) {
        console.log(error)
        return []
    }
}

export const uploadToS3 = async (fileName : string, filePath : string) => {
    try {
        const command : AWS.S3.Types.PutObjectRequest = {
            Bucket : "react-bucket",
            Key : fileName,
            Body : fs.readFileSync(filePath)
        }
        const response = await s3Client.upload(command).promise()
    } catch (error) {
        console.log("Error in uploading file to S3")
        console.log(error)
    }
}


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
            // await git.clone(githubUrl,path.join(dirname,`output/${id}`))
            // const paths = await getPaths(path.join(dirname,`output/${id}`))
            // for(const file of paths) {
            //     const fileName = file.replace(dirname, "").replace(/\\/g, "/").startsWith("/") ? file.replace(dirname, "").replace(/\\/g, "/").substring(1) : file.replace(dirname, "").replace(/\\/g, "/")
            //     // console.log(fileName)
            //     await uploadToS3(fileName,file)
            // }
            // fs.rmSync(path.join(dirname,`output/${id}`),{recursive : true, force : true})
           
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

