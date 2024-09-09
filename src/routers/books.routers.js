const { Router } = require("express");
const router = Router();
const booksCtrl = require("../controller/books.controller");

// añadir rutas

router.get("/lastBooks", booksCtrl.landing);
router.get("/lastBook", booksCtrl.lastBook);
router.get("/favoritos/:id_user", booksCtrl.likesBooks); //userLikesBooks
router.get("/load/:id_user/:currentPage", booksCtrl.userLikesBooksMore);

router.post("/addLibro/:id_user", booksCtrl.addBook);

router.get("/home/:province", booksCtrl.getBooks);
router.get("/usuarios", booksCtrl.getUsers);
router.get("/biblioteca", booksCtrl.getBooksUsers);
router.delete("/book/:id", booksCtrl.deleteBook);

router.put("/book/:id", booksCtrl.updateBook);
router.get("/book/:id", booksCtrl.getBookById);


module.exports = router;