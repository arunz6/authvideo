import userModel from "../models/user.model.js";
import config from "../config/config.js";
import crypto from "crypto";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


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


    const accestoken = jwt.sign({id:user._id},config.JWTKEY,{
      expiresIn:"15m"
    })

    const refreshtoken = jwt.sign({id:user._id}
      ,config.JWTKEY,
      { expiresIn:"7d"}
    )
    res.cookie("refreshtoken",refreshtoken,{
      httponly:true,
      secure:true, 
      sameSite:"strict",
      maxAge:7 * 24 * 60 * 1000 
    })

    res.status(201).json({
      message:"user registed donee",
      user:{
        username:user.username,
        email:user.email
      },accestoken
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

async function resfeshtoken (req ,res ) {
  const refreshtoken =  req.cookies.refreshtoken

  if(!refreshtoken){
    return res.status(401).json({
      message:"token is not present "
    })
  }
const decoded = jwt.verify(refreshtoken , config.JWTKEY)
  const accestoken = jwt.sign({
    id:decoded.id, 
  } ,config.JWTKEY,{expiresIn:"15m"})

   const newrefreshtoken = jwt.sign({id:decoded._id}
      ,config.JWTKEY,
      { expiresIn:"7d"}
    )
    res.cookie("refreshtoken",newrefreshtoken,{
     httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

  res.status(200).json({
    message:"access token refresh",
    accestoken
  })
  
}









export default {register,getme ,resfeshtoken}