## Auth

The auth is classified into two,

- Authentication
- Authorization

**Authentication (AuthN)**

- Authentication is the process of **proving your identity** to a system.
- Who are you?

**Authorization (AuthZ)**

- Authorization is about **deciding what you can access or do** *after* you’re authenticated.
- What are you allowed to do?

### Authentication methods

- Stateful (Session + Cookies)
- Stateless (JWT)

### Stateful Authentication

**Server remembers session state** for every logged-in user.

**How it works:**

1. You log in with username & password.
2. Server verifies and creates a **session record** in memory or DB.
    - Example: `{ userId: 101, sessionId: 'abc123' }`
3. Server sends a **session ID** back to you, stored in a **cookie**.
4. Every request → you send cookie → server looks up session in DB/memory → ✅ valid.

**How to secure sessions:**

- Use **HTTPS** (so cookies aren’t sniffed in network).
- Use **HttpOnly cookies** → JavaScript can’t access them.
- Use **Secure cookies** → only sent over HTTPS.
- Rotate session IDs after login.
- Use short expiry and revalidation.

**🔑 Session Auth – Behind the Scenes (BTS)**

1. **Login** → client sends username & password → server verifies → creates a `sessionId`.
2. **Server stores** → `sessionId` linked with user in memory/DB.
3. **Response** → server sends back cookie:
    
    ```
    Set-Cookie: sessionId=xyz; HttpOnly; Secure; SameSite=Strict
    ```
    
4. **Subsequent requests** → browser automatically attaches cookie:
    
    ```
    Cookie: sessionId=xyz
    ```
    
    Server validates and returns data.
    
5. **Logout** → session removed from server → cookie becomes invalid.

**🔑 Cookie Security Flags**

- `HttpOnly` → cannot be accessed by JS (prevents XSS).
- `Secure` → only via HTTPS.
- `SameSite=Strict` → blocks CSRF by not sending cookies cross-site.

**🔑 Frontend Usage**

- Use `credentials: "include"` in `fetch`/`axios` so cookies travel with requests.

**Example:**

```
    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "john", password: "1234" }),
        credentials: "include"   // 🔥 important
    });
```


### Stateless Authentication

**Server doesn’t remember anything**.

**How it works:**

1. You log in with username & password.
2. Server generates a **token (JWT)** that contains all your info (userId, role, expiry).
3. Server sends token to you.
4. Every request → you send the token → server just verifies it → ✅ valid.

**How to secure JWT:**

- Always use **short expiry (e.g., 15min)** for access tokens.
- Use **refresh tokens** (long-lived, but stored securely, often in HttpOnly cookies).
- Use **HTTPS** (never send tokens over HTTP).
- Never store JWT in `localStorage` (vulnerable to XSS).
- Use **HttpOnly + Secure cookies** or in-memory storage (for SPAs).
- Optionally: implement **token revocation** (DB blacklist, rotating tokens).

🔑 **JWT Auth – Behind the Scenes (BTS)**

1. **Login** → client sends username & password → server verifies → creates a **JWT token**.
2. **Token** = three parts:
    
    ```
    header.payload.signature
    ```
    
    - Header → algo & type
    - Payload → user info, expiry (`exp`)
    - Signature → ensures integrity (HMAC with secret key)
3. **Response** → server sends back JWT (not stored on server).
4. **Subsequent requests** → client must attach token in header:
    
    ```
    Authorization: Bearer <token>
    ```
    
5. **Server verifies** → checks token signature + expiry → grants/denies access.
6. **Logout** → client just discards token (server has no session to clear).

**🔑 Security Points**

- Tokens should **expire quickly** (use refresh tokens if needed).
- Always use **HTTPS** (prevents token sniffing).
- Do not store JWT in `localStorage` (XSS risk). Prefer **HttpOnly cookies** or memory.


**🔑 Frontend Usage**

- Use `headers.Authorization: "Bearer + token"` in `fetch`/`axios` so cookies travel with requests.

**Example:**

```
    fetch("http://localhost:3000/jwt/users", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
```

--


## JWT - Deep dive

### 1. JWT Structure

A JWT looks like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJpZCI6MSwidXNlcm5hbWUiOiJqb2huIiwiZXhwIjoxNzMwMjc4NjAwfQ
.dBjqtjB_OsqjoF3aTqvjxjXAmPnOEyVXZRUqI2Q3VQw
```

👉 Split into **3 parts** (Base64 encoded):

1. **Header** → `{ "alg": "HS256", "typ": "JWT" }`
    - Tells which algorithm was used to sign.
2. **Payload (claims)** → `{ "id": 1, "username": "john", "exp": 1730278600 }`
    - Contains **user data** + expiry (`exp`).
    - ⚠️ Visible to anyone who has the token (Base64 is not encryption).
3. **Signature** → created using secret key.
    - Ensures token can’t be tampered with.

### 2. JWT Signing & Verification

- **Signing (on login):**
    
    ```jsx
    jwt.sign({ id: user.id }, secretKey, { expiresIn: "15m" });
    ```
    
    - Payload + secret key + algorithm → signature.
- **Verification (on requests):**
    
    ```jsx
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) return res.sendStatus(403);
      console.log(decoded); // { id: 1, username: "john", iat: ..., exp: ... }
    });
    ```
    

If the signature doesn’t match (tampered token) or expired → rejected. ✅

### 3. JWT Expiry

- You **must set expiry** (e.g., `15m`, `1h`, `1d`).
- If token never expires → huge security risk (if stolen, attacker has lifetime access).

### 4. JWT Storage (Frontend)

Options:

- **LocalStorage / SessionStorage** → easy but vulnerable to XSS.
- **HttpOnly Cookie** → safest, because JS can’t access it.
- **Memory (React state)** → safest in SPA, but lost on refresh.

### 5. JWT Limitations

- If stolen, attacker can use until expiry.
- Can’t be invalidated easily (server doesn’t store them).
- Payload is visible (so don’t put sensitive info like passwords).

### Using JWT tokens at cookies

**How it’s works?**

- Server sends JWT **inside a cookie** instead of JSON response.
- Browser stores it automatically (you don’t need frontend code).
- On each request, browser automatically sends the cookie back.
- Server extracts token from cookie → verifies → grants access.
- On logout, cookie is cleared.

**🔑 Key Differences vs Header Method**

1. **No manual `Authorization: Bearer` header needed**
    - Browser automatically sends cookies with each request.
2. **Frontend must allow cookies**
    - Add `credentials: "include"` (or `axios` → `{ withCredentials: true }`) to make sure cookies are sent across domains.

**🛠 Flow**

1. User logs in → server creates both:
    - Access token (stored in HttpOnly cookie OR memory).
    - Refresh token (stored in HttpOnly cookie, or DB).
2. Access token expires → client silently sends refresh token to get new access token.
3. Refresh token expires → user must log in again.
4. On logout → both tokens cleared.


### 🚦 Rate Limiting (with Redis)

**What is Rate Limiting?**

Rate limiting is a technique to **control the number of requests** a user, client, or IP can make to your server within a specific time frame.

It helps **prevent abuse**, such as spamming APIs, brute-force attacks, or DDoS.

**Why Do We Use It?**

- Protects the server from overload.
- Ensures fair usage of APIs.
- Improves security (stops brute-force login attempts).
- Saves cost in production environments (e.g., AWS/Lambda/DynamoDB calls).

**Implementation Flow (with Redis)**

1. **Identify client** → usually by IP address or user ID.
2. **Generate a unique key** → e.g., `ratelimit:<ip>`.
3. **Check Redis for count**:
    - If key exists → increment request count.
    - If count exceeds the limit → block request (`429 Too Many Requests`).
4. **If key doesn’t exist** → create it with value `1` and attach **TTL (time-to-live)**.
    - TTL = window duration (e.g., 60 sec).
    - After TTL expires, Redis automatically deletes the key → counter resets.

**Example Flow**

- Limit: **5 requests per minute** per IP.
- Request comes → Redis key `ratelimit:127.0.0.1`.
- First request → set key = `1`, TTL = 60 sec.
- Next requests → increment key.
- If `>5` within TTL → return **429 error**.
- After 60 sec → key auto-expires → user gets fresh quota.

**Packages vs Native**

- **Native Redis**: Manual implementation (flexible, more control).
- **Packages**: e.g., `express-rate-limit`, `rate-limiter-flexible`.
    - Faster to implement.
    - Handles advanced strategies (sliding window, token bucket).
    - Less boilerplate code.