
import mongoose, { Schema } from "mongoose";

const projectVideoSchema = new Schema(
  {
    url : {
        type : String,
    },
    alt : {
        type : String,
    },
    info : {
        type : String,
    },
    description : {
        type : String,
    },
  },
  { timestamps: true }
)

export const ProjectVideo = mongoose.model("ProjectVideo", projectVideoSchema)