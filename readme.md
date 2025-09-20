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