# Node JS

→ **Node.js is single-threaded**, but it can handle many operations concurrently (like async I/O, timers, promises, etc.).

### Event loops

→ Has multiple type of phases

- Timer - Handle the process like SetTimeout, setImmediate
- Pending call-back - Execute I/O
- Idle - Internal, we can’t use.
- Poll - Heart of event loop and wait for I/O and execute it.
- Check - Execute call back sechduled by setTimeout, etc..
- Close - Executes close events.

The phase execution divide into two

- **Macrotasks** → timers, I/O, setImmediate, etc. (event loop phases).
- **Microtasks** → `process.nextTick()`, `Promise.then()` callbacks. Run before moving to next tasks

### Macro vs Micro tasks

- **Macrotasks** → callbacks scheduled in the **event loop phases**:
    - `setTimeout`
    - `setInterval`
    - `setImmediate`
    - I/O callbacks
    - Close events
- **Microtasks** → callbacks that run **between macrotasks** (before moving to the next phase):
    - `process.nextTick`
    - `Promise.then`, `async/await` resolution
    - `queueMicrotask`

> **Rule: After each macrotask completes, Node.js empties the microtask queue.**
> 

**Explanation**

1. **`process.nextTick`** → Runs **immediately after the current operation**, before the event loop continues.
    
    It has **highest priority** (it can even starve the event loop if abused).
    
2. **Promises** (`.then`) → Microtasks too, but **processed after all `nextTick` callbacks**.
3. **`setTimeout(fn, 0)`** → Goes into the **timers phase**, but "0ms" does **not mean immediately**.
    - It means: “Run this callback after **at least 0ms** and after the current phase ends.”
    - The event loop won’t touch it until the **timers phase** comes around.
4. **`setImmediate`** → Goes into the **check phase**, which happens **after poll** (so after timers, usually).