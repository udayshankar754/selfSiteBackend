import mongoose, { Schema } from "mongoose";



const aboutSchema = new Schema(
  {
    about : {
      type: String,
      required: true,
    },
    whyUsImagesId : [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WhyUs",
      }
    ]
  },
  { timestamps: true }
)

export const About = mongoose.model("About", aboutSchema)
