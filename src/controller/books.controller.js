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

async function getBooksUsers(req, res) {
    try {
        const userId = req.query.userId; 

        const sql = 
            `SELECT b.*, 
            u1.id_user AS ownerID,
            u1.name AS owner_name, 
            u1.last_name AS owner_last_name, 
            u2.id_user AS borrowerID,
            u2.name AS borrower_name, 
            u2.last_name AS borrower_last_name
            FROM book b
            LEFT JOIN user u1 ON b.owner = u1.id_user
            LEFT JOIN user u2 ON b.borrower = u2.id_user
            WHERE b.owner = ? OR (b.owner != ? AND b.borrower = ?);`;

        const [booksUsers] = await pool.query(sql, [userId, userId, userId]);

        res.json({ error: false, dataBooksUsers: booksUsers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Error al obtener los libros y usuarios" });
    }
}




module.exports = { landing, userLikesBooks, getBooks, getUsers, getBooksUsers};
