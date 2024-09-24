import mongoose ,{Schema} from "mongoose";


const gallerySchema = new Schema(
  {
    imageUrl : {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    userId : {
      type: Schema.Types.ObjectId,
      ref: "User",
    }
  },
  {
    timestamps: true,
  }
);

export const Gallery = mongoose.model("Gallery", gallerySchema)
