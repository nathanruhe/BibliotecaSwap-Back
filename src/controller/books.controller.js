const { pool } = require("../database");


async function getBooks(req, res) {
    const { status, genre, idioma, search } = req.query;  // Obtener los parámetros de la consulta
    
    try {
        let query = "SELECT * FROM book WHERE 1=1";  // Base de la consulta
        let params = [];
        
        if (status) {
            query += " AND status = ?";
            params.push(status === 'Disponible' ? true : false);  // Suponiendo que `true` es disponible
        }
        
        if (genre) {
            query += " AND genre LIKE ?";
            params.push(`%${genre}%`);
        }
        
        if (idioma) {
            query += " AND idioma LIKE ?";
            params.push(`%${idioma}%`);
        }
        
        if (search) {
            query += " AND (title LIKE ? OR author LIKE ? OR genre LIKE ?)";
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        const [books] = await pool.query(query, params);
        
        if (books.length > 0) {
            res.json({ error: false, data: books });
        } else {
            res.status(404).json({ error: true, message: "No encontrado/s" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "error al buscar" });
    }
}



async function deleteBook(req, res) {
    const { id } = req.params;
    try {
        const [result] = await pool.query("DELETE FROM book WHERE id_book = ?", [id]);
        if (result.affectedRows > 0) {
            res.json({ error: false, message: "libro eliminado" });
        } else {
            res.status(404).json({ error: true, message: "no encontrado" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "error al eliminar" });
    }
}

module.exports = { getBooks, deleteBook };