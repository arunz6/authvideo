import userModel from "../models/user.model.js";
import config from "../config/config.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Session from "../models/session.model.js";
import sessionmodel from "../models/session.model.js";


//working
async function register(req, res) {
  const { username, email, password } = req.body;

  const isalreadyregisterd = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isalreadyregisterd) {
    return res.status(409).json({
      message: "username or email is already rigistered ",
    });
  }
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
  });

  const refreshtoken = jwt.sign({ id: user._id }, config.JWTKEY, {
    expiresIn: "7d",
  });
  const refreshtokenhash = crypto
    .createHash("sha256")
    .update(refreshtoken)
    .digest("hex");

  const session = await Session.create({
    userId: user._id,
    refreshtokenhash,
    ip: req.ip,
    useragent: req.headers["user-agent"],
  });

  const accestoken = jwt.sign(
    { id: user._id, sessionId: session._id },
    config.JWTKEY,
    {
      expiresIn: "15m",
    },
  );

  res.cookie("refreshtoken", refreshtoken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    message: "user registed donee",
    user: {
      username: user.username,
      email: user.email,
    },
    accestoken,
  });
}


async function login(req,res) {
  const {email,password} = req.body
  const user =  await userModel.findOne({email})
  if(!user){
    return res.status(401).json({
      message:"invalid data "
    })
  }
  const hashedPassword  = crypto.createHash("sha256").update(password).digest("hex");
  const isPasswordValid   = hashedPassword === user.password;

  if(!isPasswordValid){
    return res.status(401).json({
      message:"invalid password"
    })
} 
  const refreshtoken = jwt.sign({
      id:user._id
    },config.JWTKEY,{
      expiresIn:"7d"
    })
    const refreshtokenHash = crypto.createHash("sha256").update(refreshtoken).digest("hex");
    const session = await sessionmodel.create({
      userId:user._id,
      refreshtokenHash,
      ip:req.ip,  
      userAgent:req.headers["user-agent"]
  })
  const accestoken = jwt.sign({
    id:user._id,
    sessionId:session._id
  },config.JWTKEY,{
    expiresIn:"15m"
  })
  res.cookie("refreshtoken",refreshtoken,{  
    httpOnly:true,  
    secure:true,
    sameSite:"strict",
    maxAge:7*24*60*60*1000
  })
  res.status(200).json({
    message:"login done ",  
    accesstoken:accestoken
  })
}

async function getme(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "token in not present",
    });
  }
  const decoded = jwt.verify(token, config.JWTKEY);

  const user = await userModel.findById(decoded.id);
  res.status(200).json({
    message: "user fatched done ",
    user: {
      username: user.username,
      email: user.email,
    },
  });
}

async function resfeshtoken(req, res) {
  const refreshtoken = req.cookies.refreshtoken;

  if (!refreshtoken) {
    return res.status(401).json({
      message: "token is not present ",
    });
  }
  const decoded = jwt.verify(refreshtoken, config.JWTKEY);

  const refreshtokenhash = crypto
    .createHash("sha256")
    .update(refreshtoken)
    .digest("hex");

  const sessions = await session.findOne({
    refreshtokenhash,
    revoked: false,
  });

  if (!sessions) {
    return res.status(401).json({
      message: "invalid token ",
    });
  }

  const accestoken = jwt.sign(
    {
      id: decoded.id,
    },
    config.JWTKEY,
    { expiresIn: "15m" },
  );

  const newrefreshtoken = jwt.sign({ id: decoded.id }, config.JWTKEY, {
    expiresIn: "7d",
  });

  const newrefreshtokenhash = crypto
    .createHash("sha256")
    .update(newrefreshtoken)
    .digest("hex");

  session.refreshtokenhash = newrefreshtokenhash;
  await session.save();

  res.cookie("refreshtoken", newrefreshtoken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    message: "access token refresh",
    accestoken,
  });
}

async function logout(req, res) {
  const refreshtoken = req.cookies.refreshtoken;
  if (!refreshtoken) {
    return res.status(400).json({
      message: "refreshtoken not found ",
    });
  }
  const refreshtokenhash = crypto
    .createHash("sha256")
    .update(refreshtoken)
    .digest("hex");
  const session = await Session .findOne({
    refreshtokenhash,
    revoked: false,
  });
  if (!session) {
    return res.status(400).json({
      message: "invalid reques  t",
    });
  }

  session.revoked = true;
  await session.save();

  res.clearCookie("refreshtoken");

  res.status(200).json({
    message: "logout done ",
  });
}


async function logoutall(req, res) {
 const refreshtoken = req.cookies.refreshtoken;
  if (!refreshtoken) {
    return res.status(400).json({
      message: "refreshtoken not found ",
    });
  }
  const decoded = jwt.verify(refreshtoken,config.JWTKEY)
  await sessionmodel.updateMany({
    user:decoded.id,
    revoked:false
  },{
    revoked:true
  })

  res.clearCookie("refreshtoken")

  res.status(200).json({
    message:"logut to all device done "
  })
}

export default { register, getme, resfeshtoken, logout ,logoutall ,login};
