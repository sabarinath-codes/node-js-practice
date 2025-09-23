const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const { authenticateToken } = require("./middleware.js");
const { generateTokens } = require("./helpers.js");

const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const users = []; //local db
const refreshtokenStorage = new Map(); //local refresh token db

router.post("/register", (req, res) => {
    const { username, password } = req.body;
    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    users.push({ id: new Date().getTime(), username, password: hashedPassword });
    res.status(201).json({ message: "User registered successfully" });
});

router.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find((user) => user.username === username);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const { accessToken, refreshToken } = generateTokens(user.id); //generate tokens

    refreshtokenStorage.set(user.id, refreshToken); //save the refresh token to the map

    //set the access token to the cookie
    res.cookie("accessToken", accessToken, { httpOnly: true, secure: false, sameSite: "strict" }); //secure is false for development
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false, sameSite: "strict" }); //secure is false for development

    res.status(200).json({ message: "Login successful" });
});

router.post("/refresh-token", (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized", error: "Refresh token is required" });
    }

    jwt.verify(refreshToken, refreshTokenSecret, (err, user) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized", error: err.message });
        }

        const storedRefreshToken = refreshtokenStorage.get(user.userId);
        if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
            return res.status(401).json({ message: "Unauthorized", error: "Invalid refresh token" });
        }
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.userId); //generate new tokens
        refreshtokenStorage.set(newRefreshToken, user.userId);
        res.cookie("accessToken", accessToken, { httpOnly: true, secure: false, sameSite: "strict" }); //set the access token to the cookie 
        res.cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: false, sameSite: "strict" });

        res.status(200).json({ message: "Refresh token successful" });
    })
});

router.get("/", authenticateToken, (req, res) => {
    res.status(200).json({ users });
});

router.post("/logout", authenticateToken, (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    refreshtokenStorage.delete(req.userId);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout successful" });
});

module.exports = router;