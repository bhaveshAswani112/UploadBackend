declare global {
    namespace NodeJS {
      interface ProcessEnv {
        TOKEN_VALUE: string;
        ACCESS_KEY_ID: string;
        SECRET_ACCESS_KEY: string;
        S3_URL: string;
      }
    }
  }
  export {};