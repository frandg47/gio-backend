const router = require("express").Router();

router.get("/", (req, res) => {
    res.send({ mensaje: "hola desde el backend" });
});

router.post("/", (req, res) => {
    const { nombre } = req.body;
    res.send(nombre);
});

module.exports = router;