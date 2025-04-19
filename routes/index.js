const router = require("express").Router();
const upload = require("../middlewares/multer")
const { createProject, getAllProjects } = require("../controllers/projectController");


router.get("/proyectos", getAllProjects);
router.post("/crear/proyecto", upload.array("gallery",10), createProject);

module.exports = router;