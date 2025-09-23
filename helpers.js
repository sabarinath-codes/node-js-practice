require("dotenv").config();
const jwt = require("jsonwebtoken");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;


const generateTokens = (userId) => {
    try {
        const accessToken = jwt.sign({ userId }, accessTokenSecret, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId }, refreshTokenSecret, { expiresIn: "7d" });
        return { accessToken, refreshToken };
    } catch (error) {
        console.error("generateTokens error", error);
        return null;
    }
}

module.exports = { generateTokens };