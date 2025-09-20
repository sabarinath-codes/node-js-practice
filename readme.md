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

````
    fetch("http://localhost:3000/jwt/users", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
```