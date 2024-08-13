async function createChatAndSendMessage(request, response) {
    try {
        const { id_user1, id_user2, emisor, message } = request.body;

        let sql = "INSERT INTO chat (id_user1, id_user2, noLeido_user1, noLeido_user2) VALUES (?, ?, 0, 0)";
        let params = [id_user1, id_user2];
        const [chatResult] = await pool.query(sql, params);

        const id_chat = chatResult.insertId;

        sql = "INSERT INTO message (id_chat, emisor, message) VALUES (?, ?, ?)";
        params = [id_chat, emisor, message];
        await pool.query(sql, params);

        sql = `
            UPDATE chat 
            SET ${emisor === 'user1' ? 'noLeido_user2' : 'noLeido_user1'} = ${emisor === 'user1' ? 'noLeido_user2' : 'noLeido_user1'} + 1
            WHERE id_chat = ?`;
        params = [id_chat];
        await pool.query(sql, params);

        response.status(200).json({ error: false, message: "Chat created and message sent" });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: true, message: "Error in chat creation or message sending" });
    }
}
