const { Router } = require("express");
const router = Router();
const userCtrl = require("../controller/users.controller");

// añadir rutas

router.get("/perfil/:id_user", userCtrl.profile);

router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login); 


module.exports = router;

// ejemplos
// router.post("/register", userCtrl.register);
// router.post("/login", userCtrl.login); 
// router.put("/usuarios", userCtrl.edit); 