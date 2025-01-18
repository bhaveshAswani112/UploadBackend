import fs from "fs";
import path  from "path";
import * as AWS from "aws-sdk";
import { ACCESS_KEY_ID, SECRET_ACCESS_KEY,S3_URL } from "./constant.js";
import {redisClient} from "./redisClient.js"




export const s3Client = new AWS.S3({
    accessKeyId : ACCESS_KEY_ID,
    secretAccessKey : SECRET_ACCESS_KEY,
    endpoint : S3_URL,
})

export const getPaths = async (dir : string) : Promise<string[]> => {
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