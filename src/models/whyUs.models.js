
import mongoose, { Schema } from "mongoose";

const whyUsImageSchema = new Schema(
  {
    image : {
      type: String,
    },
    title : {
      type: String,
    },
    description : {
      type: String,
    },
  },
  { timestamps: true }
)

export const WhyUs = mongoose.model("WhyUs", whyUsImageSchema)
