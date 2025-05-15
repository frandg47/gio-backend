// routes/index.js
const router = require("express").Router();
const upload = require("../middlewares/multer");
const { createProject, getAllProjects, getProjectById, putProject, deleteProject, updateCoverImage, updateGallery } = require("../controllers/projectController");
const { sendFormContact } = require("../controllers/formController")


//proyectos
router.get("/proyectos", getAllProjects);
router.get("/proyectos/:id", getProjectById);
router.post(
  "/crear/proyecto",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "gallery", maxCount: 20 }
  ]),
  createProject
);
router.put(
  "/editar/proyecto/:id",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "gallery", maxCount: 20 }
  ]),
  putProject
);
router.put(
  "/editar/proyecto/:id/actualizar-galeria",
  upload.fields([
    { name: "gallery", maxCount: 20 }
  ]),
  updateGallery
);
router.put(
  "/editar/proyecto/:id/actualizar-portada",
  upload.single("coverImage"),
  updateCoverImage
);
router.delete("/eliminar/proyecto/:id", deleteProject);


//contacto
router.post("/enviar/formulario", sendFormContact)

module.exports = router;
