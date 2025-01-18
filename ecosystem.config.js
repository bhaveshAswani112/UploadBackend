module.exports = {
  apps: [
    {
      name: "Upload",
      script: "./dist/index.js",
      instances: "max", // Use all available CPU cores
      exec_mode: "cluster", // Enable cluster mode for load balancing
      env: {
        PORT: 4000,
        NODE_ENV: "production",
      },
      
    },
  ],
};
