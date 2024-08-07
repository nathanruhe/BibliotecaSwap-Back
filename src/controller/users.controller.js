const {pool} = require("../database");

async function register (request, response) {
    try {
        let sql;
        let params;
        let respuesta;

        sql = `SELECT * FROM user WHERE email = ?`;
        params = [request.body.email];
        let [existe] = await pool.query(sql, params);

        if (existe.length > 0) {
            respuesta = {error: true, codigo: 200, mensaje: "Ya existe un usuario con ese email"};
        } else {
            sql = `INSERT INTO user (name, last_name, email, photo, province, availability, genres, password)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            params = [
                request.body.name,
                request.body.last_name,
                request.body.email,
                request.body.photo,
                request.body.province,
                request.body.availability,
                JSON.stringify(request.body.genres),
                request.body.password];

            let [result] = await pool.query(sql, params);
            respuesta = {error: false, codigo: 200, mensaje: "Registro completado", data: result};
        };

        response.send(respuesta);

    } catch (error) {
        console.log(error);
    };  
};


async function login (request, response) {
    try {
        let sql;
        let params;
        let respuesta;

        sql = `SELECT id_user, name, last_name, email, province FROM user WHERE email = ? AND password = ?`;
        params = [
            request.body.email,
            request.body.password];
        
        let [result] = await pool.query(sql, params);

        if (result.length === 0) {
            respuesta = {error: true, codigo: 200, mensaje: "Los datos introducidos no son válidos"};
        } else {
            let user = result[0]; 
            respuesta = {error: false, codigo: 200, mensaje: "sesion iniciada" , dataUser: user};
        };

        response.send(respuesta)

    } catch(error) {
        console.log(error);
    };
};


module.exports = {register, login};