import dotenv from "dotenv"

dotenv.config();

if (!process.env.MONGOURI) {
    throw new Error("MONGO_URI is not defined in environment variables");
}

if(!process.env.JWTKEY){
  throw new error("jwt secret is missing in environment variables")
}
if(!process.env.ClientID){
  throw new error("google client id is missing in environment variables")
} 
if(!process.env.Clientsecret) { 
  throw new error("google client secret is missing in environment variables")}
  if(!process.env.GOOGLE_REFRESH_TOKEN){
    throw new error("google refresh token is missing in environment variables")
  }
  if(!process.env.GOOGLE_USER){
    throw new error("google user email is missing in environment variables")
  }

const config = {
  MONGOURI : process.env.MONGOURI ,
  JWTKEY :process.env.JWTKEY ,
  ClientID : process.env.ClientID ,
  Clientsecret : process.env.Clientsecret ,
  GOOGLE_REFRESH_TOKEN : process.env.GOOGLE_REFRESH_TOKEN ,
  GOOGLE_USER : process.env.GOOGLE_USER ,
  
  

}

export default config