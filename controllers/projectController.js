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
        status: 404,
      });
    }
    return res.status(200).json({
      mensaje: "Proyectos obtenidos con éxito",
      status: 200,
      projects,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error interno del servidor",
      status: 500,
      error: error.message,
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res
        .status(404)
        .json({ mensaje: "Proyecto no encontrado", status: 404 });
    }
    return res.status(200).json({ project });
  } catch (error) {
    return res
      .status(500)
      .json({ mensaje: "Error al buscar el proyecto", status: 500 });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project)
      return res.status(404).json({ message: "Proyecto no encontrado" });

    if (project.coverImage?.public_id) {
      await cloudinary.uploader.destroy(project.coverImage.public_id);
    }

    if (project.gallery?.length > 0) {
      for (const img of project.gallery) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }
    await Project.findByIdAndDelete(id);

    res.status(200).json({ message: "Proyecto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar proyecto:", error);
    res.status(500).json({ message: "Error interno al eliminar el proyecto" });
  }
};

const putProject = async (req, res) => {
  try {
    const { title, description, category, details } = req.body;

    if (!title || !req.files?.coverImage || req.files.coverImage.length === 0) {
      return res
        .status(400)
        .json({ mensaje: "Faltan datos obligatorios", status: 400 });
    }

    const existingProject = await Project.findById(req.params.id);
    if (!existingProject) {
      return res
        .status(404)
        .json({ mensaje: "Proyecto no encontrado", status: 404 });
    }

    const coverFile = req.files.coverImage[0];
    const coverResult = await cloudinary.uploader.upload(coverFile.path);
    fs.unlinkSync(coverFile.path);

    const gallery = [];
    if (req.files.gallery) {
      for (const file of req.files.gallery) {
        const result = await cloudinary.uploader.upload(file.path);
        gallery.push(result.secure_url);
        fs.unlinkSync(file.path);
      }
    }

    existingProject.title = title;
    existingProject.coverImage = coverResult.secure_url;
    existingProject.gallery = gallery;
    existingProject.description = description;
    existingProject.category = category;
    existingProject.details = details;

    await existingProject.save();

    return res.status(200).json({
      mensaje: "Proyecto actualizado correctamente",
      status: 200,
      project: existingProject,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Hubo un error al actualizar el proyecto",
      status: 500,
      error: error.message,
    });
  }
};

const removeGalleryImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const { id } = req.params;

    if (!imageUrl) {
      return res
        .status(400)
        .json({ mensaje: "URL de imagen no proporcionada", status: 400 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res
        .status(404)
        .json({ mensaje: "Proyecto no encontrado", status: 404 });
    }

    project.gallery = project.gallery.filter((url) => url !== imageUrl);
    await project.save();

    return res.status(200).json({
      mensaje: "Imagen eliminada correctamente de la galería",
      status: 200,
      gallery: project.gallery,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al eliminar imagen de la galería",
      status: 500,
      error: error.message,
    });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, category, details } = req.body;

    if (!title || !req.files?.coverImage || req.files.coverImage.length === 0) {
      return res
        .status(400)
        .json({ mensaje: "Faltan datos obligatorios", status: 400 });
    }

    const existingProject = await Project.findOne({ title });
    if (existingProject) {
      return res
        .status(400)
        .json({ mensaje: "Ya existe un proyecto con ese título", status: 400 });
    }

    const coverFile = req.files.coverImage[0];
    const coverResult = await cloudinary.uploader.upload(coverFile.path);
    fs.unlinkSync(coverFile.path);

    const coverImage = {
      url: coverResult.secure_url,
      public_id: coverResult.public_id,
    };

    const gallery = [];
    if (req.files.gallery) {
      for (const file of req.files.gallery) {
        const result = await cloudinary.uploader.upload(file.path);
        gallery.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
        fs.unlinkSync(file.path);
      }
    }

    const newProject = new Project({
      title,
      coverImage,
      gallery,
      description,
      category,
      details,
    });

    await newProject.save();

    return res.status(201).json({
      mensaje: "Proyecto creado correctamente",
      status: 201,
      newProject,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Hubo un error al crear el proyecto",
      status: 500,
      error: error.message,
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  deleteProject,
  putProject,
  removeGalleryImage,
};
