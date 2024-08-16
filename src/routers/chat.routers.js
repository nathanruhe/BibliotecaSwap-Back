const express = require("express");
const router = express.Router();
const { enviarMensaje } = require("../controller/chat.controller");

router.post("/enviarMensaje", enviarMensaje);

router.get('/obtenerMensajes/:id_user1/:id_user2', async (req, res) => {
    const { id_user1, id_user2 } = req.params;
    try {
        const sql = "SELECT * FROM message WHERE (id_user1 = ? AND id_user2 = ?) OR (id_user1 = ? AND id_user2 = ?)";
        const [results] = await pool.query(sql, [id_user1, id_user2, id_user2, id_user1]);
        res.json(results);
    } catch (error) {
        console.error('Error al obtener los mensajes:', error);
        res.status(500).json({ error: true, message: 'Error al obtener los mensajes' });
    }
});


module.exports = router;
