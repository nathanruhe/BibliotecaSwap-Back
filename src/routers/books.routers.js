const { Router } = require("express");
const router = Router();
const booksCtrl = require("../controller/books.controller");

// añadir rutas

router.get("/lastBooks", booksCtrl.landing);
router.get("/favoritos/:id_user", booksCtrl.userLikesBooks);

router.put("/addLibro", booksCtrl.addBook);
router.put("/editLibro", booksCtrl.editBook);

router.get("/home", booksCtrl.getBooks);
router.get("/usuarios", booksCtrl.getUsers);

module.exports = router;

// ejemplos
// router.get("/books", booksCtrl.getAllBooks);
// router.get("/books/:id_user/:id_book", booksCtrl.getBook);
// router.post("/books", booksCtrl.postBook);
// router.put("/books", booksCtrl.putBook);
// router.delete("/books", booksCtrl.deleteBook);