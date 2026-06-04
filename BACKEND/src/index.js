import {app} from "./app.js"
import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config();






app.listen(process.env.PORT||8000,()=>{
    console.log("Process is running on the port 8000")
    connectDB();
});