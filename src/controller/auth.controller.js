import userModel from "../models/user.model.js";
import config from "../config/config.js";
import crypto from "crypto";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

//do not use it 
async function rigester (req,res) {
  const{username,email,password} = req.body

  const isalreadyregisterd = await userModel.findOne({
    $or:[
      {username},
      {email}
    ]
  })
  if(!isalreadyregisterd){
    return res.status(409).json({
      message: ""
    })
  }
   const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
const user = await userModel.create({
   username,
      email,
      password:hashedPassword
});
 const token = jwt.sign({id:user._id},config.JWTKEY,{
      expiresIn:"1d"
    })

      res.status(201).json({
      message:"user registed donee",
      user:{
        username:user.username,
        email:user.email
      },token
    })


  
}

//working 
async function register (req , res ) {
  const {username ,email ,password} = req.body

  const isalreadyregisterd =  await userModel.findOne({
    $or:[
      {username},{email}
    ]
  })


  if (isalreadyregisterd){
   return res.status(409).json({
      message:"username or email is already rigistered "
    })
  }
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    const user = await userModel.create({
      username,
      email,
      password:hashedPassword
    })


    const token = jwt.sign({id:user._id},config.JWTKEY,{
      expiresIn:"1d"
    })

    res.status(201).json({
      message:"user registed donee",
      user:{
        username:user.username,
        email:user.email
      },token
    })

  
}

async function getme(req,res) {
  const token = req.headers.authorization?.split(" ")[ 1 ];
  if(!token){
    return res.status(401).json({
      message:"token in not present"
    })
  }
  const decoded = jwt.verify(token,config.JWTKEY);

  const user = await userModel.findById(decoded.id);
  res.status(200).json({
    message:"user fatched done ",
    user:{
       username: user.username,
            email: user.email,
    }
  })
}









export default {register,getme}