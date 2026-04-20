import dotenv from 'dotenv';
dotenv.config();

export const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
};

const envt_imports = {
  mongodbUri: process.env.MONGODB_URI,
  redisHost:  process.env.REDIS_HOST,
  redisPort:  process.env.REDIS_PORT,
};

export default envt_imports;
