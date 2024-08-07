const { Router } = require("express");
const router = Router();
const booksCtrl = require("../controller/books.controller");

// añadir rutas




module.exports = router;

// ejemplos
// router.get("/books", booksCtrl.getAllBooks);
// router.get("/books/:id_user/:id_book", booksCtrl.getBook);
// router.post("/books", booksCtrl.postBook);
// router.put("/books", booksCtrl.putBook);
// router.delete("/books", booksCtrl.deleteBook);