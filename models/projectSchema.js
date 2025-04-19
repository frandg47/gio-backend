const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    coverImage: {
        type: String, 
        required: true
    },
    gallery: [
        {
            type: String 
        }
    ],
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ["Residencial", "Comercial"], 
        required: true
    },
    details: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
