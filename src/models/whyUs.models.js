
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
    userId : {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
)

export const WhyUs = mongoose.model("WhyUs", whyUsImageSchema)
