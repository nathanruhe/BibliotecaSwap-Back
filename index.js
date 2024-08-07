const app = require("./src/app")

app.listen(process.env.PORT || 3000);



app.get("/hola", (req, res) => {
    res.send({ message: "hola mundo!"})
})