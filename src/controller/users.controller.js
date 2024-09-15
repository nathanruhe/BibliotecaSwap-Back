const { pool } = require("../database");

async function register(request, response) {
    try {
        let sql;
        let params;
        let respuesta;

        sql = `SELECT * FROM user WHERE email = ?`;
        params = [request.body.email];
        let [existe] = await pool.query(sql, params);

        if (existe.length > 0) {
            respuesta = { error: true, codigo: 200, mensaje: "Ya existe un usuario con ese email" };
        } else {
            sql = `INSERT INTO user (name, last_name, email, photo, about, province, availability, genres, password)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            params = [
                request.body.name,
                request.body.last_name,
                request.body.email,
                request.body.photo,
                request.body.about,
                request.body.province,
                request.body.availability,
                JSON.stringify(request.body.genres),
                request.body.password];

            let [result] = await pool.query(sql, params);
            respuesta = { error: false, codigo: 200, mensaje: "Registro completado", data: result };
        };

        response.send(respuesta);

    } catch (error) {
        console.log(error);
    };
};

async function login(request, response) {
    try {
        let sql;
        let params;
        let respuesta;

        // Consulta info usuario
        sql = `SELECT id_user, name, last_name, email, photo, about, province, availability, genres, hidden 
            FROM user 
            WHERE email = ? AND password = ?`;
        params = [request.body.email, request.body.password];
        let [result] = await pool.query(sql, params);

        if (result.length === 0) {
            respuesta = { error: true, codigo: 200, mensaje: "Los datos introducidos no son válidos" };
        } else {
            let user = result[0];

            // Consulta media estrellas y total reseñas
            sql = `SELECT AVG(rating) as media, COUNT(rating) as totalResenas 
            FROM ratings 
            WHERE id_rated = ?`;
            params = [user.id_user];
            let [ratings] = await pool.query(sql, params);
            let rating = ratings[0].media;
            let totalResenas = ratings[0].totalResenas;

            // Consulta info reseñas
            sql = `SELECT name, last_name, rating, comment 
                   FROM ratings
                   JOIN user ON ratings.id_rater = user.id_user 
                   WHERE ratings.id_rated = ?`;
            params = [user.id_user];
            let [resenasInfo] = await pool.query(sql, params);
            let resenas = resenasInfo.map(row => ({
                name: row.name,
                last_name: row.last_name,
                rating: row.rating,
                comment: row.comment
            }));

            // Consulta info libros
            sql = `SELECT * FROM book 
                   WHERE owner = ?`;
            params = [user.id_user];
            let [libros] = await pool.query(sql, params);

            // NUEVO: Consultar todos los chats del usuario
            sql = `SELECT c.id_chat, c.id_user1, c.id_user2, c.noLeido_user1, c.noLeido_user2,
                   u2.name as user2_name, u2.last_name as user2_last_name, u2.photo as user2_photo
                   FROM chat AS c
                   JOIN user u2 ON (c.id_user2 = u2.id_user)
                   WHERE c.id_user1 = ? OR c.id_user2 = ?`;
            params = [user.id_user, user.id_user];
            let [chats] = await pool.query(sql, params);

            // Calcular total de mensajes no leídos
            let totalNoLeido = chats.reduce((total, chat) => {
                if (chat.id_user1 === user.id_user) {
                    return total + chat.noLeido_user1;
                } else {
                    return total + chat.noLeido_user2;
                }
            }, 0);

            // Para cada chat, obtener los mensajes
            let mensajes = {};
            for (let chat of chats) {
                sql = `SELECT * FROM message 
                       WHERE id_chat = ? 
                       ORDER BY timestamp ASC`;
                params = [chat.id_chat];
                let [messages] = await pool.query(sql, params);
                mensajes[chat.id_chat] = messages;
            }

            // Construimos la respuesta final incluyendo los chats y mensajes
            respuesta = {
                error: false,
                codigo: 200,
                mensaje: "Sesión iniciada",
                dataUser: {
                    ...user,
                    rating: rating || 0,
                    totalResenas: totalResenas || 0,
                    resenas: resenas || [],
                    libros: libros || [],
                    chats: chats.map(chat => ({
                        ...chat,
                        user2_name: chat.user2_name,
                        user2_last_name: chat.user2_last_name,
                        user2_photo: chat.user2_photo
                    })) || [],
                    mensajes: mensajes || {},
                    totalNoLeido: totalNoLeido || 0  // Añadido para incluir el total de mensajes no leídos
                }
            };
        }

        response.send(respuesta);

    } catch (error) {
        console.log(error);
        response.status(500).send({ error: true, codigo: 500, mensaje: "Error en el login" });
    }
}


async function profile(request, response) {
    console.log('entra profile')
    try {

        let sql;
        const params = [request.params.id_user];
        let respuesta;

        sql = `SELECT r.id_ratings, r.id_rated, r.id_rater, r.comment, u.id_user, u.name, u.last_name, u.photo, u.about, u.genres, u.province, u.availability, u.hidden FROM user AS u ` +
            `JOIN ratings AS r ON (r.id_rated = u.id_user) WHERE u.id_user = ? `;

        const [user] = await pool.query(sql, params);
        console.log(user)
        
        sql = `SELECT u.name, u.last_name, u.photo, r.rating, r.comment FROM ratings AS r
        JOIN user AS u ON r.id_rater = u.id_user 
        WHERE r.id_rated = ?`;
        
        let [resenasInfo] = await pool.query(sql, params);

        let countRatings = 0;
        let numberOfRatings = 0;

        resenasInfo.forEach( resena => {
            countRatings += resena.rating;
            numberOfRatings++;
        } );

        const media = Math.round(countRatings/numberOfRatings);
        
        respuesta = {
            error: false,
            codigo: 200,
            mensaje: "Información del usuario obtenida",
            dataUser: {
                user: user[0],
                rating: media,
                misResenas: resenasInfo || [],
            }
        };

        response.send(respuesta);

    } catch (error) {
        response.send({ error: true, codigo: 500, mensaje: error });
    };
};

async function getUserById(request, response) {
    try {
        let sql;
        let params;
        let respuesta;

        const userId = request.params.id;

        // Consulta info del usuario
        sql = `SELECT id_user, name, last_name, email, photo, about, province, availability, genres, hidden 
               FROM user 
               WHERE id_user = ?`;
        params = [userId];

        let [result] = await pool.query(sql, params);

        if (result.length === 0) {
            respuesta = { error: true, codigo: 200, mensaje: "Usuario no encontrado" };
        } else {
            let user = result[0];

            // Consulta media estrellas y total reseñas
            sql = `SELECT AVG(rating) as media, COUNT(rating) as totalResenas 
                   FROM ratings 
                   WHERE id_rated = ?`;
            params = [user.id_user];

            let [ratings] = await pool.query(sql, params);
            let rating = ratings[0].media;
            let totalResenas = ratings[0].totalResenas;

            // Consulta info reseñas
            sql = `SELECT name, last_name, rating, comment 
                   FROM ratings
                   JOIN user ON ratings.id_rater = user.id_user 
                   WHERE ratings.id_rated = ?`;
            params = [user.id_user];

            let [resenasInfo] = await pool.query(sql, params);
            let resenas = resenasInfo.map(row => ({
                name: row.name,
                last_name: row.last_name,
                rating: row.rating,
                comment: row.comment
            }));

            // Consulta info libros
            sql = `SELECT * FROM book 
                   WHERE owner = ?`;
            params = [user.id_user];

            let [libros] = await pool.query(sql, params);

            respuesta = {
                error: false,
                codigo: 200,
                mensaje: "Información del usuario obtenida",
                dataUser: {
                    ...user,
                    rating: rating || 0,
                    totalResenas: totalResenas || 0,
                    resenas: resenas || [],
                    libros: libros || [],
                }
            };
        }

        response.send(respuesta);

    } catch (error) {
        console.log(error);
    }
}

async function userHidden(request, response) {
    try{
        let sql;
        const params = [request.body.hidden, request.body.id_user];
        const params2 = [request.body.id_user];
        
        sql = `UPDATE user SET hidden = ? WHERE id_user = ?`;

        const [user] = await pool.query(sql, params);
        console.log(user);

        sql = `SELECT u.id_user, u.name, u.last_name, u.photo, u.about, u.genres, u.availability, u.hidden FROM user AS u ` +
            `WHERE u.id_user = ? ` 

        const [dataUser] = await pool.query(sql, params2);

        response.send({error: false, codigo: 200, mensaje: "Visivilidad Usuario Modificada", dataUser });

    } catch (error) {
        response.send({ error: true, codigo: 500, mensaje: error });
    }
}

async function updateProfile(request, response) {
    try {
        const { id_user, name, last_name, about, province, availability, genres } = request.body;

        const sql = `UPDATE user 
                     SET name = ?, last_name = ?, about = ?, province = ?, availability = ?, genres = ?
                     WHERE id_user = ?`;
        const params = [name, last_name, about, province, availability, JSON.stringify(genres), id_user];

        const [result] = await pool.query(sql, params);

        if (result.affectedRows > 0) {
            response.send({ error: false, codigo: 200, mensaje: "Perfil actualizado correctamente" });
        } else {
            response.send({ error: true, codigo: 400, mensaje: "No se pudo actualizar el perfil" });
        }
    } catch (error) {
        console.log(error);
        response.send({ error: true, codigo: 500, mensaje: "Error al actualizar el perfil" });
    }
}

async function updatePreferences(request, response) {
    try {
        const { id_user, availability, genres } = request.body;

        const sql = `UPDATE user 
                     SET availability = ?, genres = ?
                     WHERE id_user = ?`;
        const params = [availability, JSON.stringify(genres), id_user];

        const [result] = await pool.query(sql, params);

        if (result.affectedRows > 0) {
            response.send({ error: false, codigo: 200, mensaje: "Preferencias actualizadas correctamente" });
        } else {
            response.send({ error: true, codigo: 400, mensaje: "No se pudieron actualizar las preferencias" });
        }
    } catch (error) {
        console.log(error);
        response.send({ error: true, codigo: 500, mensaje: "Error al actualizar las preferencias" });
    }
}

async function changePassword(request, response) {
    try {
        const { id_user, currentPassword, newPassword } = request.body;

        let sql = `SELECT password FROM user WHERE id_user = ?`;
        let params = [id_user];
        let [result] = await pool.query(sql, params);

        if (result.length === 0 || result[0].password !== currentPassword) {
            return response.send({ error: true, codigo: 400, mensaje: "La contraseña actual no es correcta" });
        }

        sql = `UPDATE user SET password = ? WHERE id_user = ?`;
        params = [newPassword, id_user];
        [result] = await pool.query(sql, params);

        if (result.affectedRows > 0) {
            response.send({ error: false, codigo: 200, mensaje: "Contraseña cambiada correctamente" });
        } else {
            response.send({ error: true, codigo: 400, mensaje: "No se pudo cambiar la contraseña" });
        }
    } catch (error) {
        console.log(error);
        response.send({ error: true, codigo: 500, mensaje: "Error al cambiar la contraseña" });
    }
} 

async function addRating(req, res) {
    try {
      const { id_rated, id_rater, rating, comment } = req.body;
  
      const sql = `INSERT INTO ratings (id_rated, id_rater, rating, comment) VALUES (?, ?, ?, ?)`;
      const [result] = await pool.query(sql, [id_rated, id_rater, rating, comment]);
  
      if (result.affectedRows > 0) {
        res.status(200).json({ error: false, message: "Valoración añadida correctamente" });
      } else {
        res.status(500).json({ error: true, message: "Error al añadir la valoración" });
      }
    } catch (error) {
      console.error("Error al añadir la valoración:", error);
      res.status(500).json({ error: true, message: "Error al añadir la valoración" });
    }
  }
  

module.exports = { register, login, getUserById, profile, userHidden, updateProfile, updatePreferences, changePassword, addRating };
