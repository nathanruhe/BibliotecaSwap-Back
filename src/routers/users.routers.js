const { Router } = require("express");
const router = Router();
const userCtrl = require("../controller/users.controller");

// añadir rutas

router.get("/perfil/:id_user", userCtrl.profile);
router.put("/perfil/hidden", userCtrl.userHidden);

router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login); 
router.get("/perfil-otros/:id", userCtrl.getUserById);

router.put('/perfil/preferencias', userCtrl.updatePreferences);
router.put('/perfil/editar', usersCtrl.updateProfile);
router.put('/perfil/cambiar-contrasena', userCtrl.changePassword);

module.exports = router;