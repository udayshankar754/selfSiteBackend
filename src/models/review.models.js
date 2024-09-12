import mongoose ,{Schema} from "mongoose";


const reviewSchema = new Schema(
  {
    name : {
      type: String,
      required: true,
    },
    designation : {
      type: String,
    },
    rating : {
      type : Number,
      required: true,
    },
    review : {
      type: String,
    },
    email : {
      type: String,
    },
    mobileNumber : {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.model("Review", reviewSchema)
