import dotenv from "dotenv"

dotenv.config()

export const dirname = __dirname
export const TOKEN_VALUE = process.env.TOKEN_VALUE;
export const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
export const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY
export const S3_URL = process.env.S3_URL