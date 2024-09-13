const express = require("express");
const router = express.Router();
const { enviarMensaje, obtenerMensajes, obtenerChatsUsuario, getChatUser } = require("../controller/chat.controller");

router.get('/obtenerChatsUsuario/:id_user', obtenerChatsUsuario);
router.get('/obtenerMensajes/:id_chat', obtenerMensajes);
router.post('/enviarMensaje', enviarMensaje);


module.exports = router;