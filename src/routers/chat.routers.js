const express = require("express");
const router = express.Router();
const chatController = require("../controller/chat.controller");

router.post("/enviarMensaje", chatController.enviarMensaje);
router.post("/marcarLeido", chatController.marcarLeido);

module.exports = router;
