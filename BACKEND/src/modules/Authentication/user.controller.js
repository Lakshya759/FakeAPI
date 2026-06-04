import jwt from "jsonwebtoken"
import { asyncHandler } from "../../utils/asyncHandler.js";
import {ApiError} from "../../utils/ApiError.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import { User } from "../Authentication/user.model.js";


const generateAccessAndRefreshToken=async(user)=>{
    try {
        
        const accessToken=await user.generateAccessToken()
        
        const refreshToken=await user.generateRefreshToken()
        
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})
        console.log("runned")
        return [refreshToken,accessToken]
    } catch (error) {
        console.log("Save Error: ",error)
        throw new ApiError(500,"Unable to Generate Access and Refresh Token")
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    console.log(req.body);
    const {name, email, password }=req.body
    if(
        [name, email, password].some((field)=> field?.trim() ==="")
    ){
                throw new ApiError(400,"All fields are required")
    }

    const existedUser=await User.findOne({email});
    if(existedUser){
        throw new ApiError(409,"Email Already Exists ")
    }

    const newUser=await User.create({
        name ,
        email,
        password,
    })

    const response= await User.findById(newUser.id).select(
        "-password"
    )

    if(!response){
        throw new ApiError(500,"Something Went Wrong")
    }

    return res.status(200).json(
        new ApiResponse(200,response,"User Created Successfully")
    )
    
})

const loginUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;

    const user=await User.findOne({
        email
    })

    if(!user){
        throw new ApiError(404,"User Not Found")
    }
    
    const passwordValid=await user.comparePassword(password)
    
    if(!passwordValid){
        throw new ApiError(400,"Password is wrong")
    }

    const [refreshToken,accessToken]=await generateAccessAndRefreshToken(user)

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    };

    res
    .status(201)
    .cookie("refreshToken",refreshToken, options)
    .cookie("accessToken",accessToken, options)
    .json(
       new ApiResponse(201,"Login Successful")
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            returnDocument: "after"
        }
    )
    const options={
        httpOnly:true,
        secure: true,
        sameSite: "None"
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully"))
    

    
})

const getUser=asyncHandler(async(req,res)=>{
    const users=req.user;
    console.log(users)

    if(users){
        return res
        .status(200)
        .json(
                new ApiResponse(
                    200,
                    users,
                    "User Fetched Successfully"
                )
            )
    }
    else{
        throw new ApiError(400,"User Not Found")
    }
})

export {registerUser,loginUser,getUser,logoutUser}