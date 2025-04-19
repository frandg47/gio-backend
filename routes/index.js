// routes/index.js
const router = require("express").Router();
const upload = require("../middlewares/multer");
const { createProject, getAllProjects, getProjectById } = require("../controllers/projectController");
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

//contacto
router.post("/enviar/formulario", sendFormContact)

module.exports = router;
