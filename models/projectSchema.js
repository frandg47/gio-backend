const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: false,  
    default: "",
  },
});


const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  coverImage: {
    type: imageSchema,
    required: true,
  },
  gallery: [imageSchema], 
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ["Residencial", "Comercial"],
    required: true,
  },
  details: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
