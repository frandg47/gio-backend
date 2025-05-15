// routes/index.js
const router = require("express").Router();
const upload = require("../middlewares/multer");
const { createProject, getAllProjects, getProjectById, putProject, deleteProject, removeGalleryImage } = require("../controllers/projectController");
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
router.delete("/eliminar/proyecto/:id", deleteProject);
router.put("/proyectos/:id/remove-image", removeGalleryImage);


//contacto
router.post("/enviar/formulario", sendFormContact)

module.exports = router;
