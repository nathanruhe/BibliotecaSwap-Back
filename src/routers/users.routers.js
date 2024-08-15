const { Router } = require("express");
const router = Router();
const userCtrl = require("../controller/users.controller");

// añadir rutas
router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login); 
router.get("/perfil-otros/:id", userCtrl.getUserById);


module.exports = router;

// ejemplos
// router.post("/register", userCtrl.register);
// router.post("/login", userCtrl.login); 
// router.put("/usuarios", userCtrl.edit); 