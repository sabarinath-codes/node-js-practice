require("dotenv").config();

const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const argon2 = require("argon2");

const users = []; //local db

//bcrypt password hashing
router.post("/bcrypt", async (req, res) => {
    const { username, password } = req.body;
    const salt = await bcrypt.genSalt(10); //salt - random strings added to the password - 10 rounds
    const hashedPassword = await bcrypt.hash(password, salt);
    users.push({ username, password: hashedPassword });
    res.status(200).json({ hashedPassword });
});

//scrypt password hashing
router.post("/scrypt", async (req, res) => {
    const { username, password } = req.body;
    const salt = crypto.randomBytes(16).toString("hex"); //salt - random strings added to the password
    const hashedPassword = crypto.scryptSync(password, salt, 64).toString("hex"); // 64 - length of the hash
    users.push({ username, password: hashedPassword });
    res.status(200).json({ hashedPassword });
});

//argon2 password hashing
router.post("/argon2", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // memory cost - 64MB
        timeCost: 3, // time cost - 3 seconds
        parallelism: 1, // parallelism - 1 thread
        outputLength: 32, // output length - 32 bytes
        saltLength: 16, // salt length - 16 bytes
        hashLength: 32, // hash length - 32 bytes
        salt: crypto.randomBytes(16), // salt - random strings added to the password
    });
    users.push({ username, password: hashedPassword });
    res.status(200).json({ hashedPassword });
});

router.get("/users", (req, res) => {
    res.status(200).json({ users });
});

module.exports = router;