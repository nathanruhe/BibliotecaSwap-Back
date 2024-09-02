const express = require("express");
const router = express.Router();
const { enviarMensaje, obtenerMensajes } = require("../controller/chat.controller");

router.get('/obtenerMensajes/:id_chat', obtenerMensajes);
router.post('/enviarMensaje', enviarMensaje);

module.exports = router;
