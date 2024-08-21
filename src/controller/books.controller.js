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
        
        // let params = [this.userService.user.id_user];  
        const params = [request.params.id_user];

        let respuesta;

        let sql = `SELECT l.id_book, l.id_like, l.id_user, b.title, b.author, b.genre, b.photo, b.status FROM likes AS l ` +
                  `JOIN book AS b ON (l.id_book = b.id_book) WHERE l.id_user = ? ORDER BY l.id_like ASC`;

        let [books] = await pool.query(sql, params);
        console.log(books);

        if (books) {
            respuesta = {error: false, codigo: 200, mensaje: "Búsqueda de los libros seguidos completada", dataBook: books};
        } else {
            respuesta = {error: false, codigo: 200, mensaje: "¡Aún no tienes libros en seguimiento!"};
        };

        response.send(respuesta);

    } catch (error) {

        response.send({ error: true, codigo: 500, mensaje: error });

    };  
};

//let sql = "SELECT * FROM book";
async function getBooks(req, res) {
    try {
        console.log("obtener libros...");

        let sql = 
            `SELECT b.*, 
            u.province AS owner_province 
            FROM book b
            JOIN user u 
            ON b.owner = u.id_user`;
        let [books] = await pool.query(sql);

        books = books.map(book => ({
            ...book,
            owner_province: book.owner_province
        }));

        console.log("Libros obtenidos de la base de datos:", books);
        res.json({ error: false, dataBook: books });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Error al obtener los libros" });
    }
}

async function getUsers(req, res) {
    try {
        const sql = `SELECT * FROM user;`; 
        const [users] = await pool.query(sql); 
        res.json({ error: false, dataUsers: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Error al obtener los usuarios" });
    }
}




module.exports = { landing, userLikesBooks, getBooks, getUsers};
