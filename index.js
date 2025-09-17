const express = require("express");
const morgan = require("morgan");

const app = express();

//#1. Application level middleware
app.use((req, res, next) => {
    console.log("Application level middleware : ", req.url);
    next();
});

//#2. Router level middleware
app.use("/users", (req, res, next) => {
    console.log("Router level middleware : ", req.url);
    next();
});

//#3. Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//#4. Third-party middleware
app.use(morgan("dev"));

//#5. Error handling middleware
app.use("/account", (req, res, next) => {
    console.log("Account level middleware : ", req.url);
    next({ message: "Throw a error" });
});

app.use((err, req, res, next) => {
    console.log("Error handling middleware : ", err.message);
    res.status(500).send("Something went wrong");
});

//#6. Custom middleware
app.use((req, res, next) => {
    console.log("Custom middleware : ", req.url);
    next();
});


app.get("/", (req, res) => {
    res.send("<h1>Hello World</h1>");
});

app.get("/users", (req, res) => {
    res.send("<h1>User Page</h1>");
});

app.listen(3000, () => console.log("Server is running on port 3000"));