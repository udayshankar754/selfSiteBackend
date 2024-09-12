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
        },
        technologyUsed : {
            type : [String],
        },
        problemStatement : {
            type : String,
        },
        solution : {
            type : String,
        },
        clientName : {
            type : String,
        },
        clientDescription : {
            type : String,
        },
        clientImage : {
            type : String,
        },
        clientContactNumber : {
            type : String,
        },
        clientEmail : {
            type : String,
        },
        clientSocialConnect : [
            {
                name : {
                    type : String,
                },
                url : {
                    type : String,
                },
            }
        ],
        projectStatus : {
            type : String,
        },
        projectType : {
            type : String,
        },
        review : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        }
        
    },
    {
        timestamps: true,
    }
)


export const Project = mongoose.model("Project", projectSchema)
