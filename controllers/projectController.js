// controllers/projectController.js
const Project = require("../models/projectSchema");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        if (!projects || projects.length === 0) {
            return res.status(404).json({
                mensaje: "No se encontraron los proyectos",
                status: 404
            });
        }
        return res.status(200).json({
            mensaje: "Proyectos obtenidos con éxito",
            status: 200,
            projects
        });
    } catch (error) {
        return res.status(500).json({
            mensaje: "Error interno del servidor",
            status: 500,
            error: error.message
        });
    }
};

const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ mensaje: 'Proyecto no encontrado', status: 404 });
        }
        return res.status(200).json({ project });
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al buscar el proyecto', status: 500 });
    }
};

const createProject = async (req, res) => {
    try {
        const { title, description, category, details } = req.body;

        // Validación básica
        if (!title || !req.files?.coverImage || req.files.coverImage.length === 0) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios", status: 400 });
        }

        const existingProject = await Project.findOne({ title });
        if (existingProject) {
            return res.status(400).json({ mensaje: "Ya existe un proyecto con ese título", status: 400 });
        }

        // Subir coverImage
        const coverFile = req.files.coverImage[0];
        const coverResult = await cloudinary.uploader.upload(coverFile.path);
        fs.unlinkSync(coverFile.path); // eliminar archivo local

        // Subir galería (si hay)
        const gallery = [];
        if (req.files.gallery) {
            for (const file of req.files.gallery) {
                const result = await cloudinary.uploader.upload(file.path);
                gallery.push(result.secure_url);
                fs.unlinkSync(file.path); // eliminar archivo local
            }
        }

        const newProject = new Project({
            title,
            coverImage: coverResult.secure_url,
            gallery,
            description,
            category,
            details
        });

        await newProject.save();

        return res.status(201).json({
            mensaje: "Proyecto creado correctamente",
            status: 201,
            newProject
        });
    } catch (error) {
        return res.status(500).json({
            mensaje: "Hubo un error al crear el proyecto",
            status: 500,
            error: error.message
        });
    }
};

module.exports = {
    getAllProjects,
    getProjectById,
    createProject
};
