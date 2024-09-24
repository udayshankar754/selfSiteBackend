import mongoose, { Schema } from "mongoose";

const contactSchema = new Schema(
  {
    userId : {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    phoneNumber1 : {
      type: String,
    },
    phoneNumber2 : {
      type: String,
    },
    whatsappNumber : {
      type: String,
    },
    email : {
      type: String,
    },
    address : {
      type: String,
    },
    youtubeLink : {
      type: String,
    },
    instagramLink : {
      type: String,
    },
    facebookLink : {
      type: String,
    },
    twitterLink : {
      type: String,
    },
    githubLink : {
      type: String,
    },
    linkedinLink : {
      type: String,
    },
    addressEmbeddedCode : {
      type: String,
    }

  },
  {
    timestamps: true,
  }
)

export const Contact = mongoose.model("Contact", contactSchema)
