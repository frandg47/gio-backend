// routes/index.js
const router = require("express").Router();
const upload = require("../middlewares/multer");
const { createProject, getAllProjects } = require("../controllers/projectController");

router.get("/proyectos", getAllProjects);

// coverImage (1), gallery (hasta 10)
router.post(
  "/crear/proyecto",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "gallery", maxCount: 10 }
  ]),
  createProject
);

module.exports = router;
