const http = require("http");

console.log("Hello World! Welcome to Node.js");

console.log("Starting of event loop");

setTimeout(() => console.log("This is a set timeout"), 0);
setImmediate(() => console.log("This is a set immediate"));
process.nextTick(() => console.log("This is a process next tick"));
Promise.resolve().then(() => console.log("This is a promise resolve"));

console.log("Ending of event loop");

//Raw node js server

const server = http.createServer((req, res) => {
    console.log("Request received : ", req.url);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>Hello World</h1>");
})

server.listen(3000, () => console.log("Server is running on port 3000"));