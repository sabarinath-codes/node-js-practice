const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const routes = require("./routes.js");

const { rateLimiter } = require("./middleware.js");

const app = express();
app.use(express.json());
app.use(cookieParser()); //for cookies
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

app.use(rateLimiter); //rate limiting using redis

app.get("/", (req, res) => {
    res.status(200).send("<h1>Hello World! Welcome to Sabari's Server</h1>");
});

//jwt auth - refresh token
app.use("/users", routes);

app.listen(3000, () => console.log("Server is running on port 3000"));