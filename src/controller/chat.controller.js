const {pool} = require("../database");

async function obtenerChatsUsuario(request, response) {
    const id_user  = request.params;

    try {
        const [chats] = await pool.query(`
            SELECT 
                c.id_chat, 
                c.id_user1, 
                c.id_user2, 
                u.name as user_name,
                u.photo as user_photo,
                (SELECT message FROM message WHERE id_chat = c.id_chat ORDER BY timestamp DESC LIMIT 1) AS last_message,
                c.noLeido_user1, 
                c.noLeido_user2
            FROM chat c
            JOIN user u ON u.id_user = CASE WHEN c.id_user1 = ? THEN c.id_user2 ELSE c.id_user1 END
            WHERE c.id_user1 = ? OR c.id_user2 = ?
            ORDER BY (SELECT timestamp FROM message WHERE id_chat = c.id_chat ORDER BY timestamp DESC LIMIT 1) DESC
        `, [id_user, id_user, id_user]);

        if (chats.length === 0) {
            return response.status(404).json({ error: true, message: "No hay chats" });
        }

        response.status(200).json(chats);
    } catch (error) {
        console.error("Error buscando chats:", error);
        response.status(500).json({ error: true, message: "No se pudo buscar chats" });
    }
}

async function obtenerMensajes(request, response) {
    const { id_chat, userId } = request.params;

    try {
        const [rows] = await pool.query(
            `SELECT * FROM message WHERE id_chat = ? ORDER BY timestamp ASC`,
            [id_chat]
        );
        if (rows.length === 0) {
            return response.status(404).json({ error: true, message: "No hay mensajes" });
        }

        const updateSql = `
            UPDATE chat
            SET ${userId == 'id_user1' ? 'noLeido_user1' : 'noLeido_user2'} = 0
            WHERE id_chat = ?`;
        await pool.query(updateSql, [id_chat]);

        response.status(200).json({ messages: rows });
    } catch (error) {
        console.error("Error buscando mensajes:", error);
        response.status(500).json({ error: true, message: "No se pudo buscar mensajes" });
    }
}

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
            SET ${emisor === id_user1 ? 'noLeido_user2' : 'noLeido_user1'} = ${emisor === id_user1 ? 'noLeido_user2' : 'noLeido_user1'} + 1
            WHERE id_chat = ?`;
        params = [id_chat];
        await pool.query(sql, params);

        response.status(200).json({ error: false, message: "Chat creado/existe y mensaje enviado" });
    } catch (error) {
        console.error("Error enviando mensaje:", error);
        response.status(500).json({ error: true, message: "Error creando chat o enviando mensaje" });
    }
}



<<<<<<< HEAD
        const updateSql = `
            UPDATE chat
            SET ${userId == 'user1' ? 'noLeido_user1' : 'noLeido_user2'} = 0
            WHERE id_chat = ?`;
        await pool.query(updateSql, [id_chat]);

        response.status(200).json({ messages: rows });
    } catch (error) {
        console.error("Error buscando mensajes:", error);
        response.status(500).json({ error: true, message: "No se pudo buscar mensajes" });
    }
}

async function obtenerChatsUsuario(request, response) {
    console.log('Dentro de obtener chats');
    
    try {
        const id_user  = request.params.id_user;
        console.log('id_user:' + id_user);
        
        const [chats] = await pool.query(`
            SELECT 
                c.id_chat, 
                c.id_user1, 
                c.id_user2, 
                u.name as user_name,
                u.photo as user_photo,
                (SELECT message FROM message WHERE id_chat = c.id_chat ORDER BY timestamp DESC LIMIT 1) AS last_message,
                c.noLeido_user1, 
                c.noLeido_user2
            FROM chat c
            JOIN user u ON u.id_user = CASE WHEN c.id_user1 = ? THEN c.id_user2 ELSE c.id_user1 END
            WHERE c.id_user1 = ? OR c.id_user2 = ?
            ORDER BY (SELECT timestamp FROM message WHERE id_chat = c.id_chat ORDER BY timestamp DESC LIMIT 1) DESC
        `, [id_user, id_user, id_user]);

        if (chats.length === 0) {
            return response.status(404).json({ error: true, message: "No hay chats" });
        }

        response.status(200).json(chats);
    } catch (error) {
        console.error("Error buscando chats:", error);
        response.status(500).json({ error: true, message: "No se pudo buscar chats" });
    }
}
=======
>>>>>>> 627aef3bffc870091ddac2325c8ef267df6013aa


module.exports = {
    obtenerChatsUsuario,
    obtenerMensajes,
    enviarMensaje,
};