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
                type: Schema.Types.ObjectId,
                ref: "ProjectImage",
            }
        ],
        video : [
            {
                type: Schema.Types.ObjectId,
                ref: "ProjectVideo",
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
    },
    {
        timestamps: true,
    }
)


export const Project = mongoose.model("Project", projectSchema)
