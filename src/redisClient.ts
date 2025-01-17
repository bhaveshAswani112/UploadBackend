import { createClient } from 'redis';


export let redisClient  : any;


export const initializeRedisClient = async () => {
    redisClient = await createClient({
        url: 'redis://localhost:6379'
    })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
}