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

async function getBooks(request, response) {

    const { userId } = req.query; 

    try {
        let sql = "SELECT * FROM book WHERE owner != ?";
        let [books] = await pool.query(sql, [userId]);

        response.json({ error: false, dataBook: books });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: true, message: "Error al obtener los libros" });
    }
}

async function addLike(req, res) {
    const { id_user, id_book } = req.body;

    try {
        const sql = "INSERT INTO likes (id_user, id_book) VALUES (?, ?)";
        const [result] = await pool.query(sql, [id_user, id_book]);

        res.status(200).json({ error: false, message: "Like añadido", result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Error al añadir like" });
    }
}

async function getUserLikes(req, res) {
    const { id_user } = req.params;

    try {
        const sql = `SELECT likes.id_book, likes.id_user FROM likes JOIN book ON likes.id_book = book.id_book WHERE likes.id_user = ?`;
        const [result] = await pool.query(sql, [id_user]);

        res.status(200).json({ error: false, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Error al obtener los likes" });
    }
}

module.exports = { landing, userLikesBooks, getBooks, addLike, getUserLikes };
