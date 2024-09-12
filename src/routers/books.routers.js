const { Router } = require("express");
const router = Router();
const booksCtrl = require("../controller/books.controller");

// añadir rutas

router.get("/lastBooks", booksCtrl.landing);
router.get("/lastBook", booksCtrl.lastBook);
//router.get("/favoritos/:id_user", booksCtrl.userLikesBooks);
router.get("/load/:id_user/:currentPage", booksCtrl.userLikesBooksMore);

router.post("/addLibro/:id_user", booksCtrl.addBook);

router.get("/home/:province", booksCtrl.getBooks);
router.get("/usuarios", booksCtrl.getUsers);
router.get("/biblioteca", booksCtrl.getBooksUsers);
router.delete("/book/:id", booksCtrl.deleteBook);

router.put("/book/:id", booksCtrl.updateBook);
router.get("/book/:id", booksCtrl.getBookById);

router.put("/:id/status", booksCtrl.updateBookStatus);

router.post('/updateExpiredBooks', booksCtrl.updateExpiredBooks);

//router.get("/favoritos/:province/:id_user", booksCtrl.iLikeBooks);
router.get('/favoritos', booksCtrl.getAllLikes);
router.post('/addLike', booksCtrl.addLike)
router.delete('/removeLike', booksCtrl.removeLike);
router.get('/books-likes', booksCtrl.booksLikes);

module.exports = router;