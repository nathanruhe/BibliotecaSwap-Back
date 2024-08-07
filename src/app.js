const express = require("express");
const cors = require('cors');
const usersRouters = require("./routers/users.routers");
const BooksRouters = require("./routers/books.routers");
const errorHandling = require("./error/errorHandling");

const app = express();

app.set("port", process.env.PORT || 3000);

app.get('/status', (req, res) => {
    res.json({ message: "API DESPLEGADA" });
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(usersRouters);
app.use(BooksRouters);
app.use(function(req, res, next) {
    res.status(404).json({error:true, codigo: 404, message: "Endpoint doesnt found"});
});

app.use(errorHandling);

module.exports = app;