const express = require("express");
const router = express.Router();
const { enviarMensaje } = require("../controller/chat.controller");
const pool = require("../database");

router.get('/obtenerMensajes/:id_chat', async (req, res) => {
    const { id_chat } = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT * FROM message WHERE id_chat = ? ORDER BY timestamp ASC`,
            [id_chat]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: true, message: "No hay memsajes" });
        }
        res.status(200).json({ messages: rows });
    } catch (error) {
        console.error("Error buscancdo mensaje:", error);
        res.status(500).json({ error: true, message: "No se pudo buscar mensaje" });
    }
});

router.post('/enviarMensaje', enviarMensaje);

module.exports = router;
