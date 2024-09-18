const express = require("express");
const router = express.Router();
const chatCtrl = require("../controller/chat.controller");

// Obtener mensajes de un chat específico
router.get("/:id_chat/messages", chatCtrl.getMessages);

// Obtener los usuarios con los que el usuario ha tenido conversaciones
// router.get("/chats/:id_user", chatCtrl.getUsersWithChats);
router.get("/obtenerChatsUsuario/:id_user", chatCtrl.getUsersWithChats);

// Enviar mensaje
router.post("/enviarMensaje", chatCtrl.enviarMensaje);

// Resetear mensajes no leídos
router.put(
  "/:id_chat/resetUnreadMessages/:userId",
  chatCtrl.resetUnreadMessages
);

// Elimina el chat
router.delete("/:id_user", chatCtrl.deleteChatByUserId);

module.exports = router;
