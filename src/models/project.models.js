import mongoose ,{Schema} from "mongoose";

const projectSchema = new Schema(
    {
        projectName : {
            type : String,
            required : true
        },
        projectDescription : {
            type : String,
        },
        images : [
            {
                url : {
                    type : String,
                },
                alt : {
                    type : String,
                },
                imageInfo : {
                    type : String,
                },
                imageDescription : {
                    type : String,
                },
            }
        ],
        video : [
            {
                url : {
                    type : String,
                },
                alt : {
                    type : String,
                },
                videoInfo : {
                    type : String,
                },
                videoDescription : {
                    type : String,
                },
            }
        ],
        projectLink : {
            type : String,
        },
        githubLink : {
            type : String,
        }
        
    },
    {
        timestamps: true,
    }
)


export const Project = mongoose.model("Project", projectSchema)
