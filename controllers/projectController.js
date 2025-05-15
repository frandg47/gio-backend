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

    const existingProject = await Project.findById(req.params.id);
    if (!existingProject) {
      return res
        .status(404)
        .json({ mensaje: "Proyecto no encontrado", status: 404 });
    }

    existingProject.title = title;
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

const updateGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const existingImages = JSON.parse(req.body.existingImages || "[]");

    console.log("existingImages recibido:", req.body.existingImages);
    console.log("existingImages parseado:", existingImages);

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado",
        status: 404,
      });
    }

    // 1. Eliminar de Cloudinary las imágenes que ya no están
    const urlsAEliminar = project.gallery.filter(
      (img) => !existingImages.some((existing) => existing.url === img.url)
    );

    for (const img of urlsAEliminar) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // 2. Mantener las imágenes que siguen en la galería
    const updatedGallery = project.gallery.filter((img) =>
      existingImages.some((existing) => existing.url === img.url)
    );

    // 3. Subir nuevas imágenes si se enviaron
    if (req.files?.gallery) {
      const files = Array.isArray(req.files.gallery)
        ? req.files.gallery
        : [req.files.gallery];

      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path);
        updatedGallery.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
        fs.unlinkSync(file.path); // Eliminar archivo local después de subir
      }
    }

    // 4. Actualizar y guardar el proyecto
    project.gallery = updatedGallery;
    await project.save();

    return res.status(200).json({
      mensaje: "Galería actualizada correctamente",
      status: 200,
      gallery: updatedGallery,
    });
  } catch (error) {
    console.error("Error al actualizar galería:", error);
    return res.status(500).json({
      mensaje: "Error al actualizar la galería",
      status: 500,
      error: error.message,
    });
  }
};

const updateCoverImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ mensaje: "No se subió ninguna imagen" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado" });
    }

    // Eliminar imagen vieja de Cloudinary si existe
    if (project.coverImage?.public_id) {
      await cloudinary.uploader.destroy(project.coverImage.public_id);
    }

    // Subir nueva imagen
    const result = await cloudinary.uploader.upload(req.file.path);

    // Eliminar archivo local
    fs.unlinkSync(req.file.path);

    // Actualizar el proyecto
    project.coverImage = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await project.save();

    return res.status(200).json({
      mensaje: "Imagen de portada actualizada correctamente",
      coverImage: project.coverImage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error al actualizar portada" });
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
  updateGallery,
  updateCoverImage,
};
