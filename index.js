const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

app.get("/", (req, res) => {
    res.status(200).send("<h1>Hello World! Welcome to Sabari's Server</h1>");
});

//session auth
const sessionAuthSecretKey = "sessionAuth123";
const users = []; //dummy users

//session middleware
const sessionMiddleware = session({
    secret: sessionAuthSecretKey, //used to sign the session id
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } //true only in https
});

app.use("/session/users", sessionMiddleware); //assigns the session middleware to the users route

app.get("/session/users", (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Unauthorized");
    }
    res.status(200).send(users);
});

app.get("/session/users/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log("Id: ", id);
    const user = users.find(user => user.id === id);
    if (!user) {
        return res.status(404).send("User not found");
    }
    res.status(200).send(user);
});

app.post("/session/users/register", (req, res) => {
    console.log("Request body: ", req.body);
    const { username, password } = req.body;
    users.push({ id: users.length + 1, username, password: bcrypt.hashSync(password, 10) });
    res.status(201).send({ message: "User registered successfully" });
});

app.post("/session/users/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && bcrypt.compareSync(password, user.password));
    if (user) {
        req.session.user = user;
        res.status(200).send({ message: "User logged in successfully" });
    } else {
        res.status(401).send("Invalid username or password");
    }
});

app.post("/session/users/logout", (req, res) => {
    req.session.destroy();
    res.status(200).send("Logged out");
});


//Jwt auth
const jwtAuthSecretKey = "jwtAuth123";

function authenticateJwt(req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    console.log("Authenticate Headers: ", req.headers.authorization);
    console.log("Token: ", token);
    if (!token) {
        return res.status(401).send({ message: "Unauthorized" });
    }
    jwt.verify(token, jwtAuthSecretKey, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized" });
        }
        req.user = decoded;
        next();
    });
}

app.post("/jwt/users/register", (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        users.push({ id: users.length + 1, username, password: bcrypt.hashSync(password, 10) });
        res.status(201).send({ message: "User registered successfully" });
    } else {
        res.status(400).send({ message: "Username and password are required" });
    }
});

app.post("/jwt/users/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && bcrypt.compareSync(password, user.password));
    if (user) {
        res.status(200).send({ message: "User logged in successfully", token: jwt.sign({ userId: user.id }, jwtAuthSecretKey, { expiresIn: "1h" }) });
    } else {
        res.status(401).send({ message: "Invalid username or password" });
    }
});

app.get("/jwt/users/:id", authenticateJwt, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const user = users.find(user => user.id === id);
    if (user) {
        res.status(200).send({ user });
    } else {
        res.status(404).send({ message: "User not found" });
    }
});

app.get("/jwt/users", authenticateJwt, (req, res) => {
    res.status(200).send({ users });
});

//logout is only on client side

app.listen(3000, () => console.log("Server is running on port 3000"));