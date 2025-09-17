# ExpressJs

- Express.js is a **web framework for Node.js**.
- It **sits on top of Node’s `http` module**, making it easier to build APIs and web applications.
- Instead of writing raw `http.createServer(...)`, you can use Express which provides:
    - **Simplified routing** (`app.get('/path', ...)`)
    - **Middleware support** (for logging, parsing JSON, authentication, etc.)
    - **Error handling**
    - **Better structure for large applications**

### Express app structure

- `app` → main Express application.
- `app.METHOD(path, handler)` → route handlers (`METHOD` = GET, POST, PUT, DELETE).
- `req` → request object (incoming data).
- `res` → response object (send data back).
- `app.listen(port)` → start the server.

> **Express is just an abstraction layer on top of Node’s `http` module** that makes web development easier.
> 

## Middleware

A middleware function is just a function that runs between the incoming request (`req`) and the outgoing response (`res`).

- `req` → request object (incoming data).
- `res` → response object (what we send back).
- `next()` → a function that calls the **next middleware in the chain**.

**Types of middleware**

1. Application level
2. Route level
3. In-build
4. Third-party
5. Custom
6. Error handling