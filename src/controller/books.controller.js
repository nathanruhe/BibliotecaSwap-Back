const { pool } = require("../database");

async function landing(request, response) {
    try {

        let respuesta;

        let sql = `SELECT id_book, photo, genre FROM book ORDER BY id_book DESC LIMIT 9`;

        let [result] = await pool.query(sql);
        console.log(result);

        if (result) {
            respuesta = { error: false, codigo: 200, mensaje: "Búsqueda de las últimas adquisiciones de Biblioteca Completada", dataBook: result };
        };

        response.send(respuesta);

    } catch (error) {

        response.send({ error: true, codigo: 500, mensaje: error });

    };
};

async function userLikesBooks(request, response) {
    try {
        const params = [request.params.id_user];

        let respuesta;

        let sql = `SELECT l.id_book, l.id_like, l.id_user, b.title, b.author, b.genre, b.photo, b.status FROM likes AS l ` +
            `JOIN book AS b ON (l.id_book = b.id_book) WHERE l.id_user = ? ORDER BY l.id_like ASC LIMIT 7`;

        let [books] = await pool.query(sql, params);
        console.log(books);

        if (books) {
            respuesta = { error: false, codigo: 200, mensaje: "Búsqueda de los libros seguidos completada", dataBook: books };
        } else {
            respuesta = { error: false, codigo: 200, mensaje: "¡Aún no tienes libros en seguimiento!" };
        };

        response.send(respuesta);

    } catch (error) {

        response.send({ error: true, codigo: 500, mensaje: error });

    };
};

async function userLikesBooksMore(request, response) {
    try {

        currentPage = +request.params.currentPage;
        itemsPerPage = 7;
        
        let n = itemsPerPage * currentPage;
        
        const params = [request.params.id_user, n];
        
        let respuesta;

        let sql = `SELECT l.id_book, l.id_like, l.id_user, b.title, b.author, b.genre, b.photo, b.status FROM likes AS l ` +
            `JOIN book AS b ON (l.id_book = b.id_book) WHERE l.id_user = ? ORDER BY l.id_like ASC LIMIT 7 OFFSET ?`;

        let [books] = await pool.query(sql, params);
        console.log('libros:', books);

        currentPage = currentPage + 1;
        if (books) {
            respuesta = { error: false, codigo: 200, mensaje: "Búsqueda de los libros seguidos completada", dataBook: books, currentPage };
        } else {
            respuesta = { error: false, codigo: 200, mensaje: "¡Aún no tienes libros en seguimiento!" };
        };
        response.send(respuesta);

    } catch (error) {

        response.send({ error: true, codigo: 500, mensaje: error });

    };
};

async function getBooks(req, res) {
    try {
        console.log("obtener libros...");

        const params = [req.params.province]

        let sql =
            `SELECT b.*, 
            u.province AS owner_province 
            FROM book b
            JOIN user u 
            ON b.owner = u.id_user
            WHERE u.province = ? AND u.hidden != false`;

        let [books] = await pool.query(sql, params);

        books = books.map(book => ({
            ...book,
            owner_province: book.owner_province
        }));

        //console.log("Libros obtenidos de la base de datos:", books);
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

async function deleteBook(req, res) {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        await connection.beginTransaction();

        await connection.query('DELETE FROM `likes` WHERE id_book = ?', [id]);
        const [result] = await connection.query('DELETE FROM `book` WHERE id_book = ?', [id]);

        
        if (result.affectedRows > 0) {
            await connection.commit();
            res.status(200).json({ error: false, message: "libro eliminado correctamente" });
        } else {
            await connection.rollback();
            res.status(404).json({ error: true, message: "libro no encontrado" });
        }
    } catch (error) {
        await connection.rollback();
        console.error("error al eliminar el libro:", error);
        res.status(500).json({ error: true, message: "error al eliminar el libro" });
    } 
}

async function updateBook(req, res) {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { title, author, genre, photo, language } = req.body;

        if (!id) {
            throw new Error("El ID del libro no es válido");
        }

        const sql = 
            `UPDATE book
            SET title = ?, author = ?, genre = ?, photo = ?, language = ?
            WHERE id_book = ?`;

        const [result] = await connection.query(sql, [title, author, genre, photo, language, id]);

        if (result.affectedRows > 0) {
            res.status(200).json({ error: false, message: "libroBack actualizado" });
        } else {
            res.status(404).json({ error: true, message: "Libro no encontrado" });
        }
    } catch (error) {
        console.error("Error al actualizar el libro:", error);
        res.status(500).json({ error: true, message: "Error al actualizar el libro" });
    } finally {
        connection.release();
    }
}

async function getBookById(req, res) {
    try {
        const { id } = req.params;

        const sql = `SELECT * FROM book WHERE id_book = ?`;
        const [result] = await pool.query(sql, [id]);

        if (result.length > 0) {
            res.status(200).json({ error: false, data: result[0] });
        } else {
            res.status(404).json({ error: true, message: "libro no encontrado" });
        }
    } catch (error) {
        console.error("error por id", error);
        res.status(500).json({ error: true, message: "error por id" });
    }
}

async function lastBook(request, response) {
    try {
        const sql = `SELECT u.id_user, b.id_book, b.title, b.author, b.genre, b.photo, b.owner, b.status FROM book AS b
                  JOIN user AS u ON (b.owner = u.id_user) WHERE b.owner = 6 ORDER BY b.id_book DESC LIMIT 1`;
        const [book] = await pool.query(sql);
        response.json({ error: false, book: book[0] });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: true, message: "Error al obtener los usuarios" });
    }
}

async function addBook(request, response) {
    try {

        let sql;
        let params = [request.body.title, request.body.author, request.body.genre, request.body.photo, request.body.idioma, request.params.id_user];

        sql = "INSERT INTO book (title, author, genre, photo, language, owner) VALUES (?, ?, ?, ?, ?, ?)";
        console.log(sql);

        let [result] = await pool.query(sql, params);
        console.log(result);

        sql = `SELECT u.id_user, b.id_book, b.title, b.author, b.genre, b.photo, b.owner, b.status FROM book AS b
                  JOIN user AS u ON (b.owner = u.id_user) WHERE b.owner = 6 ORDER BY b.id_book DESC LIMIT 1`;
        
        let [resultBook] = await pool.query(sql, params);

        let respuesta = { error: false, codigo: 200, mensaje: "Libro Insertado Correctamente", book: resultBook };
        response.send(respuesta);

    } catch (error) {
        console.error(error);
        response.status(500).json({ error: true, message: "Error: el usuario del libro no existe" });
    }
}

async function updateBookStatus(req, res) {
    const connection = await pool.getConnection();
    try {
      const { id } = req.params;
      const { status, start_date, end_date, borrower } = req.body;
  
      if (!id) {
        throw new Error("El ID del libro no es válido");
      }
  
      const sql = 
        `UPDATE book
         SET status = ?, start_date = ?, end_date = ?, borrower = ?
         WHERE id_book = ?`;
  
      const [result] = await connection.query(sql, [status, start_date, end_date, borrower, id]);
  
      if (result.affectedRows > 0) {
        res.status(200).json({ error: false, message: "Estado, fechas y prestatario del libro actualizados correctamente" });
      } else {
        res.status(404).json({ error: true, message: "Libro no encontrado" });
      }
    } catch (error) {
      console.error("Error al actualizar el estado, fechas y prestatario del libro:", error);
      res.status(500).json({ error: true, message: "Error al actualizar el estado, fechas y prestatario del libro" });
    } finally {
      connection.release();
    }
  }
  
  

module.exports = { landing, userLikesBooks, userLikesBooksMore, getBooks, getUsers, lastBook, addBook, getBooksUsers, deleteBook, updateBook, getBookById, updateBookStatus };
