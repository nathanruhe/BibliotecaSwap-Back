const { Router } = require("express");
const router = Router();
const booksCtrl = require("../controller/books.controller");

// añadir rutas

router.get("/lastBooks", booksCtrl.landing);
router.get("/favoritos/:id_user", booksCtrl.userLikesBooks);

// router.post("/addLibro", booksCtrl.addBook);

router.get("/home/:province", booksCtrl.getBooks);
router.get("/usuarios", booksCtrl.getUsers);

module.exports = router;