import mongoose from "mongoose";

const sessionsession = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      require: [true, "user is required "],
    },
    refreshtokenhash: {
      type: String,
      require: [true, "refresh tokenis not require "],
    },
    ip: {
      type: String,
      require: [true, "ip is not require "],
    },
    useragent: {
      type: String,
      require: [true, "useragent is require"],
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);


const  sessionmodel = mongoose.model("session",sessionsession)


export default sessionmodel