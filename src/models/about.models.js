import mongoose from "mongoose";

const aboutSchema = new Schema(
  {
    about : {
      type: String,
      required: true,
    },
    whyUs : [
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
      }
    ]
    
   
  },
  { timestamps: true }
)


export const About = mongoose.model("About", aboutSchema)
