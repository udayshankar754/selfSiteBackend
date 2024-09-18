
import mongoose, { Schema } from "mongoose";

const projectImageSchema = new Schema(
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

export const ProjectImage = mongoose.model("ProjectImage", projectImageSchema)