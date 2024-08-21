const {pool} = require("../database");

async function register (request, response) {
    try {
        let sql;
        let params;
        let respuesta;

        sql = `SELECT * FROM user WHERE email = ?`;
        params = [request.body.email];
        let [existe] = await pool.query(sql, params);

        if (existe.length > 0) {
            respuesta = {error: true, codigo: 200, mensaje: "Ya existe un usuario con ese email"};
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
            respuesta = {error: false, codigo: 200, mensaje: "Registro completado", data: result};
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
            respuesta = {error: true, codigo: 200, mensaje: "Los datos introducidos no son válidos"};
        } else {
            let user = result[0]; 

            // consulta media estrellas y total reseñas
            sql = `SELECT AVG(rating) as media, COUNT(rating) as totalResenas 
            FROM ratings 
            WHERE id_rated = ?`;
            params = [user.id_user];

            let [ratings] = await pool.query(sql, params);
            let rating = ratings[0].media;
            let totalResenas = ratings[0].totalResenas;

            // consulta info reseñas
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

            // consulta info libros
            sql = `SELECT * FROM book 
                   WHERE owner = ?`;
            params = [user.id_user];

            let [libros] = await pool.query(sql, params);

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
                }
            };
        };

        response.send(respuesta);

    } catch (error) {
        console.log(error);
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
            respuesta = {error: true, codigo: 200, mensaje: "Usuario no encontrado"};
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

module.exports = { register, login, getUserById };