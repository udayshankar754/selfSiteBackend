import { Contact } from "../models/contact.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"

const addContacts = asyncHandler(async (req, res) => {

    const { phoneNumber1 , phoneNumber2 , whatsappNumber , email , address , youtubeLink , instagramLink , facebookLink , twitterLink , githubLink , linkedinLink , addressEmbeddedCode } = req.body;

    if(!(phoneNumber1 && whatsappNumber && email && address && addressEmbeddedCode)) {
        throw new ApiError(400, "Please fill all required fields");
    }

    const userId = req.user?._id

    if(!userId) {
        throw new ApiError(401, "Unauthorized user");
    }
    
    const existedContact = await Contact.find({
        userId : userId
    });

    if(existedContact.length > 0) {
        throw new ApiError(400, "Contact already exists for this user");
    }

    const contact = await Contact.create({
        userId ,
        phoneNumber1 ,
        phoneNumber2 ,
        whatsappNumber ,
        email ,
        address ,
        youtubeLink ,
        instagramLink ,
        facebookLink ,
        twitterLink ,
        githubLink ,
        linkedinLink ,
        addressEmbeddedCode
    })

    res.status(200).json(
        new ApiResponse(200 , contact , "Contact created successfully")
    )
})


const editContacts = asyncHandler ( async (req , res) => {
    const { id } = req.params;

    const { phoneNumber1 , phoneNumber2 , whatsappNumber , email , address , youtubeLink , instagramLink , facebookLink , twitterLink , githubLink , linkedinLink , addressEmbeddedCode } = req.body;

    if(!(phoneNumber1 || phoneNumber2 || whatsappNumber || email || address || facebookLink || twitterLink || addressEmbeddedCode || youtubeLink || instagramLink || githubLink ||linkedinLink)) {
        throw new ApiError(400, "Please provide at least one field to update");
    }

    const isValidContact = await Contact.findById(id);

    if(!isValidContact) {
        throw new ApiError(400, "Invalid Contact Id");
    }

    const updateContact = await Contact.findByIdAndUpdate(id , {
        $set : {
            phoneNumber1 ,
            phoneNumber2,
            whatsappNumber,
            email,
            address,
            youtubeLink,
            instagramLink,
            youtubeLink,
            facebookLink,
            linkedinLink,
            githubLink,
            twitterLink,
            addressEmbeddedCode
        }
    },
    {
        new: true,
    }
    )

    return res.status(200).json(
        new ApiResponse(
            200 , 
            updateContact ,
            "Update Contact Successfully"
        )
    )

})


const deleteContacts = asyncHandler ( async (req, res) => {

    const { id } = req.params;

    const isValidContact = await Contact.findById(id);

    if(!isValidContact) {
        throw new ApiError(401, "Invalid Contact ID");
    }

    await Contact.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200 , null , "Contact deleted successfully")
    )
});

export {
    addContacts, 
    editContacts,
    deleteContacts
}