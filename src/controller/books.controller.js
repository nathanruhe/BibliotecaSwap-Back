const {pool} = require("../database");

async function landing (request, response) {
    try {
        
        let respuesta;

        let sql = `SELECT id_book, photo, genre FROM book ORDER BY id_book DESC LIMIT 9`;

        let [result] = await pool.query(sql);
        console.log(result);

        if (result) {
            respuesta = {error: false, codigo: 200, mensaje: "Búsqueda de las últimas adquisiciones de Biblioteca Completada", dataBook: result};
        };

        response.send(respuesta);

    } catch (error) {

        response.send({ error: true, codigo: 500, mensaje: error });

    };  
};

async function userLikesBooks (request, response) {
    try {
        
        let params = [request.url.id_user];  
        // body.id_user;

        let respuesta;

        let sql = `SELECT l.id_book, l.id_like, l.id_user, b.title, b.author, b.genre, b.photo, b.status FROM like AS l WHERE l.id_user = ? ` +
                  `JOIN book AS b ON (l.id_book = b.id_book) ORDER BY l.id_like ASC LIMIT 8`;

        let [result] = await pool.query(sql, params);
        console.log(result);

        if (result) {
            respuesta = {error: false, codigo: 200, mensaje: "Búsqueda de los libros seguidos completada", databook: result};
        } else {
            respuesta = {error: false, codigo: 200, mensaje: "¡Aún no tienes libros en seguimiento!"};
        };

        response.send(respuesta);

    } catch (error) {

        response.send({ error: true, codigo: 500, mensaje: error });

    };  
};

module.exports = { landing, userLikesBooks };