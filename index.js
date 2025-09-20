const express = require("express");
const morgan = require("morgan");
const session = require("express-session");

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
    users.push({ id: users.length + 1, username, password });
    res.status(201).send({ message: "User registered successfully" });
});

app.post("/session/users/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
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



app.listen(3000, () => console.log("Server is running on port 3000"));