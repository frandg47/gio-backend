const Project = require("../models/projectSchema");
const cloudinary = require("cloudinary").v2;

const getAllProjects = async (req, res) => {
    const projects = await Project.find()

    try {
        if (!projects) {
            return res.status(404).json({
                mensaje: "No se encontraron los proyectos",
                status: 404
            })
        }
        return res.status(201).json({
            mensaje: "Los proyectos se encontraron exitosamente",
            status: 201,
            projects
        })
    } catch (error) {
        return res.status(500).json({
            mensaje: "Hubo un error, intente más tarde",
            status: 500
        })
    }
}

const createProject = async (req, res) => {
    const { title, coverImage, description, category, details} = req.body;
    const { path } = req.file;
    const project = await Project.findOne({ title });
    const cloudImg = await cloudinary.uploader.upload(path);
    const gallery = []

    try {
        if(project) {
            return res.status(400).json({
                mensaje: "Proyecto existente",
                status: 400
            })
        }
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path);
            gallery.push({
                url: result.secure_url
            })
        }
        const newProject = new Project({
            title,
            coverImage: cloudImg.secure_url,
            gallery,
            description,
            category,
            details
        })
        await newProject.save();

        return res.status(201).json({
            mensaje: "Proyecto creado correctamente",
            status: 201,
            newProject
        })
    } catch (error) {
        return res.status(500).json({
            mensaje: "Hubo un error, intente más tarde",
            status: 500,
            error: error.message
        })
    }
}

module.exports = {
    getAllProjects,
    createProject
}