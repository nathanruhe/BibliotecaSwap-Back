const pool = require("../database");

async function enviarMensaje(request, response) {
    try {
        const { id_user1, id_user2, emisor, message } = request.body;

        let sql = "SELECT id_chat FROM chat WHERE (id_user1 = ? AND id_user2 = ?) OR (id_user1 = ? AND id_user2 = ?)";
        let params = [id_user1, id_user2, id_user2, id_user1];
        const [chatResult] = await pool.query(sql, params);

        let id_chat;
        if (chatResult.length > 0) {
            id_chat = chatResult[0].id_chat;
        } else {
            sql = "INSERT INTO chat (id_user1, id_user2, noLeido_user1, noLeido_user2) VALUES (?, ?, 0, 0)";
            params = [id_user1, id_user2];
            const [newChatResult] = await pool.query(sql, params);
            id_chat = newChatResult.insertId;
        }

        sql = "INSERT INTO message (id_chat, emisor, receptor, message) VALUES (?, ?, ?, ?)";
        params = [id_chat, emisor, emisor === id_user1 ? id_user2 : id_user1, message];
        await pool.query(sql, params);

        sql = `
            UPDATE chat 
            SET ${emisor === 'user1' ? 'noLeido_user2' : 'noLeido_user1'} = ${emisor === 'user1' ? 'noLeido_user2' : 'noLeido_user1'} + 1
            WHERE id_chat = ?`;
        params = [id_chat];
        await pool.query(sql, params);

        response.status(200).json({ error: false, message: "Chat creado/existe y mensaje enviado" });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: true, message: "Error creando chat o enviando mensaje" });
    }
}

async function obtenerMensajes(request, response) {
    const { id_chat } = request.params;

    try {
        const [rows] = await pool.query(
            `SELECT * FROM message WHERE id_chat = ? ORDER BY timestamp ASC`,
            [id_chat]
        );
        if (rows.length === 0) {
            return response.status(404).json({ error: true, message: "No hay mensajes" });
        }
        response.status(200).json({ messages: rows });
    } catch (error) {
        console.error("Error buscando mensajes:", error);
        response.status(500).json({ error: true, message: "No se pudo buscar mensajes" });
    }
}

module.exports = {
    enviarMensaje,
    obtenerMensajes
};
