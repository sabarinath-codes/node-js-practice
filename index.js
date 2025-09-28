const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const https = require("https"); //for https server
const fs = require("fs");

const { rateLimiter } = require("./middleware.js");
const routes = require("./routes.js");

const app = express();
app.use(express.json());
app.use(cookieParser()); //for cookies
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

//certificate for https server
//created using mkcert - mkcert localhost 127.0.0.1 ::1 - creates a self-signed certificate
const certificate = {
    key: fs.readFileSync("localhost-key.pem"),
    cert: fs.readFileSync("localhost.pem"),
};

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

app.use(rateLimiter); //rate limiting using redis

app.get("/", (req, res) => {
    res.status(200).send("<h1>Hello World! Welcome to Sabari's secure Server</h1>");
});

app.use("/api", routes);

//https server
https.createServer(certificate, app).listen(3000, () => console.log("Secure server is running on port 3000"));