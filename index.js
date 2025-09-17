console.log("Hello World! Welcome to Node.js");

console.log("Starting of event loop");

setTimeout(() => console.log("This is a set timeout"), 0);
setImmediate(() => console.log("This is a set immediate"));
process.nextTick(() => console.log("This is a process next tick"));
Promise.resolve().then(() => console.log("This is a promise resolve"));

console.log("Ending of event loop");