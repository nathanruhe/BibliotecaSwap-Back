const { pool } = require("../database");

// Obtener los usuarios con los que el usuario ha tenido conversaciones
async function getUsersWithChats(request, response) {
    const id_user = request.params.id_user;

    if (!id_user) {
        return response.status(400).json({ error: true, message: "ID de usuario no proporcionado" });
    }

    try {
        const [users] = await pool.query(`
            SELECT DISTINCT u.id_user, u.name, u.last_name, u.photo
            FROM chat c
            JOIN user u ON (u.id_user = c.id_user1 OR u.id_user = c.id_user2)
            WHERE (c.id_user1 = ? OR c.id_user2 = ?) AND u.id_user != ?
        `, [id_user, id_user, id_user]);

        if (users.length === 0) {
            return response.status(404).json({ error: true, message: "No se encontraron usuarios con chats" });
        }

        response.status(200).json(users);
    } catch (error) {
        console.error("Error buscando usuarios con chats:", error);
        response.status(500).json({ error: true, message: "No se pudo buscar usuarios con chats" });
    }
}


// Obtener los mensajes de un chat específico
async function getMessages(request, response) {
    const { id_chat } = request.params;

    if (!id_chat) {
        return response.status(400).json({ error: true, message: "ID de chat no proporcionado" });
    }

    try {
        const [messages] = await pool.query(`
            SELECT m.id_message, m.id_chat, m.id_sender, m.id_receiver, m.message, m.timestamp, 
                   u1.name AS sender_name, u1.photo AS sender_photo,
                   u2.name AS receiver_name, u2.photo AS receiver_photo
            FROM message AS m
            JOIN user AS u1 ON m.id_sender = u1.id_user
            JOIN user AS u2 ON m.id_receiver = u2.id_user
            WHERE m.id_chat = ?
            ORDER BY m.timestamp ASC
        `, [id_chat]);

        if (messages.length === 0) {
            return response.status(404).json({ error: true, message: "No se encontraron mensajes" });
        }

        response.status(200).json({ error: false, messages });
    } catch (error) {
        console.error("Error al obtener mensajes:", error);
        response.status(500).json({ error: true, message: "Error al obtener mensajes" });
    }
}


// Enviar un mensaje en un chat
async function enviarMensaje(request, response) {
    try {
        const { id_user1, id_user2, emisor, message } = request.body;

        if (!id_user1 || !id_user2 || !emisor || !message) {
            return response.status(400).json({ error: true, message: "Faltan datos en la solicitud" });
        }

        let sql = `
            SELECT id_chat 
            FROM chat 
            WHERE (id_user1 = ? AND id_user2 = ?) 
            OR (id_user1 = ? AND id_user2 = ?)
        `;
        let params = [id_user1, id_user2, id_user2, id_user1];
        const [chatResult] = await pool.query(sql, params);

        let id_chat;
        if (chatResult.length > 0) {
            id_chat = chatResult[0].id_chat;
        } else {
            sql = `
                INSERT INTO chat (id_user1, id_user2, noLeido_user1, noLeido_user2) 
                VALUES (?, ?, 0, 0)
            `;
            params = [id_user1, id_user2];
            const [newChatResult] = await pool.query(sql, params);
            id_chat = newChatResult.insertId;
        }

        sql = `
            INSERT INTO message (id_chat, id_sender, id_receiver, message, timestamp) 
            VALUES (?, ?, ?, ?, NOW())
        `;
        params = [id_chat, emisor, emisor === id_user1 ? id_user2 : id_user1, message];
        await pool.query(sql, params);

        sql = `
            UPDATE chat 
            SET ${emisor === id_user1 ? 'noLeido_user2' : 'noLeido_user1'} = ${emisor === id_user1 ? 'noLeido_user2' : 'noLeido_user1'} + 1
            WHERE id_chat = ?
        `;
        params = [id_chat];
        await pool.query(sql, params);

        response.status(200).json({ error: false, message: "Mensaje enviado con éxito" });
    } catch (error) {
        console.error("Error enviando mensaje:", error);
        response.status(500).json({ error: true, message: "Error enviando mensaje" });
    }
}


// Resetear mensajes no leídos
async function resetUnreadMessages(request, response) {
    const { id_chat, userId } = request.params;

    if (!id_chat || !userId) {
        return response.status(400).json({ error: true, message: "ID de chat o ID de usuario no proporcionado" });
    }

    try {
        const updateSql = `
            UPDATE chat
            SET ${userId === 'id_user1' ? 'noLeido_user2' : 'noLeido_user1'} = 0
            WHERE id_chat = ?
        `;
        await pool.query(updateSql, [id_chat]);

        response.status(200).json({ message: "Mensajes no leídos reseteados" });
    } catch (error) {
        console.error("Error al resetear mensajes no leídos:", error);
        response.status(500).json({ error: true, message: "No se pudieron resetear los mensajes no leídos" });
    }
}


// Eliminar el chat basado en el id_user
async function deleteChatByUserId(req, res) {
    const { id_user } = req.params;

    try {
        // Obtener todos los chats asociados con el id_user
        let sql = `
            SELECT id_chat 
            FROM chat 
            WHERE id_user1 = ? OR id_user2 = ?
        `;
        const [chats] = await pool.query(sql, [id_user, id_user]);

        if (chats.length === 0) {
            return res.status(404).json({ error: true, message: "No se encontraron chats para el usuario especificado" });
        }

        // Eliminar los mensajes asociados a estos chats
        const chatIds = chats.map(chat => chat.id_chat);
        sql = `DELETE FROM message WHERE id_chat IN (?)`;
        await pool.query(sql, [chatIds]);

        // Eliminar los chats
        sql = `DELETE FROM chat WHERE id_chat IN (?)`;
        await pool.query(sql, [chatIds]);

        res.status(200).json({ error: false, message: "Chats eliminados correctamente" });
    } catch (error) {
        console.error("Error al eliminar chats:", error);
        res.status(500).json({ error: true, message: "Error al eliminar chats" });
    }
}

module.exports = {
    getUsersWithChats,
    getMessages,
    enviarMensaje,
    resetUnreadMessages,
    deleteChatByUserId
};