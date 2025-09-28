## 🔒 HTTPS (TLS/SSL) local hosting

**Why HTTPS?**

- Encrypts traffic → no sniffing passwords/tokens.
- Ensures data integrity.
- Proves server identity.

**🔹 Development**

Install **mkcert** (local trusted SSL):

```bash
mkcert -install
mkcert localhost
```

This generates `localhost.pem` and `localhost-key.pem`.

Express HTTPS server:

```jsx
https.createServer({
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem")
}, app).listen(3000, () => {
  console.log("Running at https://localhost:3000");
});
```

**🔹 Production (Free SSL with Let’s Encrypt + Certbot)**

1. Install certbot (Ubuntu):
    
    ```bash
    sudo apt update
    sudo apt install certbot
    ```
    
2. Generate certificate:
    
    ```bash
    sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
    ```
    
    Files saved in `/etc/letsencrypt/live/yourdomain.com/`.
    
    - `fullchain.pem` → certificate
    - `privkey.pem` → private key
3. Use in Node.js:

```jsx
https.createServer({
  key: fs.readFileSync("/etc/letsencrypt/live/yourdomain.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/yourdomain.com/fullchain.pem")
}, app).listen(443, () => {
  console.log("HTTPS server running on https://yourdomain.com");
});
```

## Password hashing

**🔑 Why Hash Passwords?**

- Storing raw passwords is a huge security risk.
- If your database leaks → attackers instantly know user credentials.
- Hashing protects users by storing **irreversible transformations** of passwords instead of plain text.

**🌈 Rainbow Table Attack**

- A **rainbow table** is a pre-computed list of common passwords → hashes.
- If you only use simple hashing (e.g., SHA256), attackers can instantly match hashes.
- **Solution**: Use **salt** (unique random value per password) so the same password hashes differently for each user.

**🍚 Salt & 🌶️ Pepper**

- **Salt**: random string added to each password before hashing.
    - Ensures even identical passwords produce unique hashes.
    - Stored **with the hash** in DB.
- **Pepper**: global secret string added to all passwords.
    - Stored securely in environment variables, not DB.
    - Adds an extra hidden layer of security.

### ⚡ Hashing Algorithms

**1. bcrypt (1999)**

- Widely used, stable, supported everywhere.
- Adds **salt automatically**.
- Adjustable **cost factor** (work factor) controls how slow hashing is.
- Still secure for most web applications today.

**2. scrypt (2009)**

- Designed to be **memory-hard** as well as CPU-hard.
- Prevents GPU/ASIC attackers from scaling cheaply.
- Uses large chunks of RAM during hashing.
- Common in **cryptocurrency wallets** and modern secure systems.

**3. Argon2 (2015, Password Hashing Competition Winner)**

- State-of-the-art hashing algorithm.
- **Variants**:
    - Argon2i → resistant to side-channel attacks, good for password hashing.
    - Argon2d → resistant to GPU attacks, good for crypto.
    - Argon2id → hybrid, recommended by OWASP.
- Highly tunable: memory, time, and parallelism.
- Best choice for **new applications** today.

⚖️ Comparison

| Feature           | bcrypt    | scrypt   | Argon2id (recommended) |
| ----------------- | --------- | -------- | ---------------------- |
| Year              | 1999      | 2009     | 2015 (PHC winner)      |
| Salt              | Auto      | Auto     | Auto                   |
| GPU resistance    | Medium    | Strong   | Strong                 |
| Memory hardness   | ❌ No      | ✅ Yes    | ✅ Yes (configurable)   |
| Side-channel safe | Partially | Weak     | ✅ Yes (i/id)           |
| Adoption          | Very high | Moderate | Growing (OWASP best)   |
