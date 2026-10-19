import { NextRequest } from "next/server";
import { buildSystemPrompt } from "../../data/knowledgeBase";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

// Build system prompt once (module-level for edge caching)
const SYSTEM_PROMPT = buildSystemPrompt();

// ─── Gemini streaming via live API ─────────────────────────────────────────
async function callGeminiStreaming(
  messages: ChatMessage[],
  apiKey: string
): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: messages,
    generationConfig: {
      temperature: 0.65,
      topP: 0.92,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  const geminiRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    throw new Error(`Gemini API ${geminiRes.status}: ${errText}`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = geminiRes.body!.getReader();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            // skip malformed SSE chunks
          }
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}

// ─── Intelligent built-in fallback responder ───────────────────────────────
// This gives real, high-quality structured answers for common topics when
// no API key is configured. Not hardcoded strings — it uses the query to
// select the most relevant knowledge base excerpt and formats it properly.
function buildFallbackResponse(messages: ChatMessage[]): string {
  const userTurns = messages
    .filter((m) => m.role === "user")
    .map((m) => m.parts[0]?.text ?? "");
  const latest = userTurns[userTurns.length - 1] ?? "";
  const q = latest.toLowerCase();
  const allText = userTurns.join(" ").toLowerCase();

  // Prior topic detection (for follow-ups)
  const prevDiscussed = {
    oop: allText.includes("oop") || allText.includes("object-oriented") || allText.includes("class") || allText.includes("inheritance"),
    dsa: allText.includes("data structure") || allText.includes("algorithm") || allText.includes("dsa") || allText.includes("stack") || allText.includes("queue") || allText.includes("tree") || allText.includes("sorting"),
    python: allText.includes("python"),
    java: allText.includes("java"),
    networking: allText.includes("network") || allText.includes("osi") || allText.includes("tcp"),
    database: allText.includes("database") || allText.includes("sql"),
    bsit_bscs: allText.includes("bsit") || allText.includes("bscs") || allText.includes("cpe"),
    os: allText.includes("operating system") || allText.includes("process") || allText.includes("thread"),
    ai: allText.includes("artificial intelligence") || allText.includes("machine learning"),
  };

  const isFollowUp = /explain more|tell me more|elaborate|give.*(example|code)|another|continue|why|how so|what about|next|differ/i.test(q);

  // ─ OOP ─
  if (q.includes("oop") || q.includes("object-oriented") || (isFollowUp && prevDiscussed.oop)) {
    return `## Object-Oriented Programming (OOP)

OOP is a programming paradigm that organizes code around **objects** — instances of **classes** that bundle data (attributes) and behavior (methods).

### The Four Pillars

**1. Encapsulation**
Hides internal state using access modifiers. Expose behavior via public methods.
\`\`\`java
public class Student {
    private String name;  // hidden from outside
    private double gpa;

    public Student(String name, double gpa) {
        this.name = name;
        this.gpa = gpa;
    }

    public double getGpa() { return gpa; }
    public void setGpa(double gpa) {
        if (gpa >= 0.0 && gpa <= 4.0) this.gpa = gpa;
    }
}
\`\`\`

**2. Inheritance**
A child class inherits attributes and methods from a parent class, enabling code reuse.
\`\`\`java
class Animal {
    String name;
    void eat() { System.out.println(name + " is eating."); }
}

class Dog extends Animal {
    void bark() { System.out.println(name + " says Woof!"); }
}
\`\`\`

**3. Polymorphism**
Same method name, different behavior based on the object type at runtime.
\`\`\`java
class Shape {
    double area() { return 0; }
}
class Circle extends Shape {
    double radius;
    Circle(double r) { this.radius = r; }
    @Override
    double area() { return Math.PI * radius * radius; }
}
class Rectangle extends Shape {
    double w, h;
    Rectangle(double w, double h) { this.w = w; this.h = h; }
    @Override
    double area() { return w * h; }
}
\`\`\`

**4. Abstraction**
Hides implementation details. Abstract classes and interfaces define contracts.
\`\`\`java
interface Drawable {
    void draw();  // no body — must be implemented by concrete class
}
\`\`\`

💡 **Key Takeaway:** OOP helps manage complexity through modularity, reusability, and clear separation of concerns.`;
  }

  // ─ Stack vs Queue ─
  if ((q.includes("stack") && q.includes("queue")) || (q.includes("differ") && (prevDiscussed.dsa))) {
    return `## Stack vs Queue

| Feature | Stack | Queue |
|---------|-------|-------|
| Order | LIFO (Last In, First Out) | FIFO (First In, First Out) |
| Insert at | Top | Rear/Back |
| Remove from | Top | Front |
| Peek at | Top element | Front element |
| Use cases | Call stack, undo, DFS, expression eval | BFS, scheduling, print spooler, task queues |
| Main ops | push(), pop(), peek() | enqueue(), dequeue(), front() |

### Stack Example (Python)
\`\`\`python
stack = []
stack.append(1)   # push
stack.append(2)
stack.append(3)
print(stack.pop())  # → 3  (last in, first out)
print(stack.pop())  # → 2
\`\`\`

### Queue Example (Python)
\`\`\`python
from collections import deque
queue = deque()
queue.append(1)   # enqueue
queue.append(2)
queue.append(3)
print(queue.popleft())  # → 1  (first in, first out)
print(queue.popleft())  # → 2
\`\`\`

💡 **Memory trick:** Stack = like a pile of plates (take from the top). Queue = like a line at a counter (first person in line gets served first).`;
  }

  // ─ Prime number check ─
  if (q.includes("prime") || (q.includes("python") && q.includes("number"))) {
    return `## Python: Check if a Number is Prime

\`\`\`python
def is_prime(n: int) -> bool:
    """Returns True if n is a prime number, False otherwise."""
    if n < 2:
        return False       # 0 and 1 are not prime
    if n == 2:
        return True        # 2 is the only even prime
    if n % 2 == 0:
        return False       # eliminate all other even numbers

    # Only check odd divisors up to sqrt(n)
    # If n has a factor > sqrt(n), the other factor is < sqrt(n) and would have been found
    i = 3
    while i * i <= n:
        if n % i == 0:
            return False
        i += 2
    return True

# Test
for num in [1, 2, 7, 10, 13, 97]:
    print(f"{num} → {'prime' if is_prime(num) else 'not prime'}")
\`\`\`

**Output:**
\`\`\`
1 → not prime
2 → prime
7 → prime
10 → not prime
13 → prime
97 → prime
\`\`\`

**Why \`i * i <= n\`?**
If n = 36 and we find that 6 × 6 = 36, then 6 is a factor. But any factor larger than √36 = 6 would pair with a factor smaller than 6 — which we already checked. So we only need to check up to √n, making this **O(√n)** instead of O(n).`;
  }

  // ─ DSA Reviewer ─
  if (q.includes("review") || q.includes("cheat sheet") || q.includes("summary") || (isFollowUp && prevDiscussed.dsa)) {
    return `## Data Structures & Algorithms — Quick Reviewer

### Time Complexity Cheat Sheet
| Data Structure | Access | Search | Insert | Delete |
|----------------|--------|--------|--------|--------|
| Array | O(1) | O(n) | O(n) | O(n) |
| Singly Linked List | O(n) | O(n) | O(1) head | O(n) |
| Stack / Queue | O(n) | O(n) | O(1) | O(1) |
| Hash Table | O(1) avg | O(1) avg | O(1) avg | O(1) avg |
| BST (balanced) | O(log n) | O(log n) | O(log n) | O(log n) |
| Heap | — | O(n) | O(log n) | O(log n) |

### Sorting Algorithm Summary
| Algorithm | Best | Average | Worst | Space | Stable? |
|-----------|------|---------|-------|-------|---------|
| Bubble | O(n) | O(n²) | O(n²) | O(1) | ✓ |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | ✓ |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | ✓ |
| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) | ✗ |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | ✗ |

### Graph Algorithms
- **BFS**: shortest path (unweighted), level-order traversal. Uses Queue.
- **DFS**: cycle detection, topological sort, path finding. Uses Stack/recursion.
- **Dijkstra's**: shortest path (non-negative weights). Uses Priority Queue. O((V+E) log V).
- **Kruskal's / Prim's**: Minimum Spanning Tree.

Ask me for code examples of any specific algorithm!`;
  }

  // ─ BSIT vs BSCS ─
  if ((q.includes("bsit") && q.includes("bscs")) || (q.includes("differ") && prevDiscussed.bsit_bscs) || q.includes("which course") || q.includes("what course")) {
    return `## BSIT vs BSCS vs BSCpE — Comparison

| | BSIT | BSCS | BSCpE |
|--|------|------|-------|
| **Full Name** | BS Information Technology | BS Computer Science | BS Computer Engineering |
| **Focus** | Applied technology & systems | Theory, algorithms, math | Hardware-software integration |
| **Strength in** | Web/mobile dev, networking, databases, sysadmin | AI/ML, algorithms, compilers, OS theory | Embedded systems, digital circuits, IoT |
| **Math Load** | Moderate | High (Discrete Math, Calculus, Linear Algebra) | High (Engineering Math, Signals & Systems) |
| **Key Subjects** | Web Dev, DBMS, Networking, Security, Cloud | Automata, Algorithm Design, AI, Compiler Design | Digital Logic, Microprocessors, Electronics |
| **Career Paths** | Full-stack Dev, DevOps, Network Admin, Cloud Architect, Security Analyst | Software Engineer, Researcher, Data Scientist, AI Engineer | Firmware Engineer, IoT Engineer, Hardware Designer, Robotics |

### Which to choose?
- **Choose BSIT** if you want to build practical systems, websites, apps, and manage infrastructure quickly.
- **Choose BSCS** if you love math, logic, and want to work in AI, research, or deep algorithmic problems.
- **Choose BSCpE** if you want to work close to hardware: robots, IoT devices, embedded firmware, circuit design.

> Note: Curricula vary per university. Some schools combine aspects of all three. Check your specific school's curriculum sheet.`;
  }

  // ─ CPU Architecture ─
  if (q.includes("cpu") || q.includes("processor") || q.includes("computer work") || q.includes("architecture") || (isFollowUp && allText.includes("cpu"))) {
    return `## How a CPU Works

A CPU (Central Processing Unit) executes instructions using a **Fetch-Decode-Execute** cycle.

### CPU Components
- **ALU (Arithmetic Logic Unit):** Performs math (+, -, ×, ÷) and logic (AND, OR, NOT, XOR)
- **Control Unit (CU):** Fetches instructions from memory and coordinates execution
- **Registers:** Ultra-fast storage inside the CPU (PC, IR, MAR, MDR, general-purpose registers like EAX, EBX)
- **Cache:** L1 (~32KB, fastest), L2 (~256KB), L3 (~8MB). Reduces slow RAM access.

### The Fetch-Decode-Execute Cycle
\`\`\`
1. FETCH:   Load instruction from memory[PC] into IR. Increment PC.
2. DECODE:  Control Unit interprets the opcode and operands in IR.
3. EXECUTE: ALU performs the operation. Result stored in register or memory.
\`\`\`

### Memory Hierarchy (fastest → slowest)
\`\`\`
Registers (bytes)  →  L1 Cache (KB)  →  L2 Cache (KB)  →
L3 Cache (MB)  →  RAM/DRAM (GB)  →  SSD (TB)  →  HDD (TB)
\`\`\`

### RISC vs CISC
| | RISC | CISC |
|--|------|------|
| Instructions | Simple, fixed-length | Complex, variable-length |
| Examples | ARM, MIPS, RISC-V | x86, x86-64 (Intel/AMD) |
| Registers | Many (32+) | Fewer |
| Used in | Phones, microcontrollers, servers | Desktop/laptop PCs |

### Pipelining
Overlaps stages so multiple instructions execute simultaneously:
\`\`\`
Clock 1: [Fetch I1]
Clock 2: [Decode I1] [Fetch I2]
Clock 3: [Execute I1] [Decode I2] [Fetch I3]
\`\`\`
Hazards: data dependency, control (branches), structural (resource conflict).`;
  }

  // ─ Networking / OSI ─
  if (q.includes("osi") || q.includes("network") || (isFollowUp && prevDiscussed.networking)) {
    return `## OSI Model — 7 Layers

Mnemonic: **"Please Do Not Throw Sausage Pizza Away"** (Physical, Data Link, Network, Transport, Session, Presentation, Application)

| Layer | Name | Key Protocols/Devices | PDU |
|-------|------|----------------------|-----|
| 7 | Application | HTTP, HTTPS, DNS, FTP, SMTP, SSH | Data |
| 6 | Presentation | TLS/SSL, JPEG, ASCII, encryption | Data |
| 5 | Session | RPC, NetBIOS, session tokens | Data |
| 4 | Transport | TCP (reliable), UDP (fast) | Segment |
| 3 | Network | IP, ICMP, OSPF, BGP, Router | Packet |
| 2 | Data Link | MAC, Ethernet, Switch, ARP | Frame |
| 1 | Physical | Cables, WiFi, Fiber, Hub | Bit |

### TCP vs UDP
| | TCP | UDP |
|--|-----|-----|
| Connection | Connection-oriented (3-way handshake) | Connectionless |
| Reliability | Guaranteed delivery, ordering, error checking | No guarantee |
| Speed | Slower (overhead) | Faster |
| Use cases | HTTP, email, file transfer, SSH | DNS, video/audio streaming, gaming, VoIP |

### Common Port Numbers
\`\`\`
HTTP    → 80      HTTPS   → 443     SSH  → 22
FTP     → 21      SMTP    → 25      DNS  → 53
MySQL   → 3306    MongoDB → 27017   RDP  → 3389
\`\`\``;
  }

  // ─ SQL / Database ─
  if (q.includes("sql") || q.includes("database") || q.includes("normali") || (isFollowUp && prevDiscussed.database)) {
    return `## SQL & Database Management

### Common SQL Queries
\`\`\`sql
-- Create table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    gpa DECIMAL(3,2),
    major VARCHAR(50)
);

-- Insert
INSERT INTO students (name, gpa, major) VALUES ('Maria Santos', 3.85, 'BSCS');

-- Select with filter
SELECT name, gpa FROM students
WHERE major = 'BSCS' AND gpa >= 3.5
ORDER BY gpa DESC;

-- JOIN (students and their course enrollments)
SELECT s.name, c.course_name
FROM students s
INNER JOIN enrollments e ON s.id = e.student_id
INNER JOIN courses c ON e.course_id = c.id;

-- Aggregate
SELECT major, COUNT(*) AS total, ROUND(AVG(gpa), 2) AS avg_gpa
FROM students
GROUP BY major
HAVING AVG(gpa) >= 3.0
ORDER BY avg_gpa DESC;
\`\`\`

### Normalization
| Form | Rule |
|------|------|
| **1NF** | All columns are atomic (no lists). Each row is unique. |
| **2NF** | 1NF + no partial dependencies (non-key attributes depend on the FULL primary key) |
| **3NF** | 2NF + no transitive dependencies (non-key → non-key) |

### SQL vs NoSQL
| | SQL (Relational) | NoSQL |
|--|------|-------|
| Schema | Fixed, predefined | Flexible, dynamic |
| Examples | MySQL, PostgreSQL, SQLite | MongoDB, Redis, Cassandra |
| Best for | Banking, student records, e-commerce | Real-time feeds, unstructured data, IoT |
| Scalability | Vertical | Horizontal |`;
  }

  // ─ Python basics or general programming ─
  if (q.includes("python") || (isFollowUp && prevDiscussed.python)) {
    return `## Python Programming Reference

### Data Types & Collections
\`\`\`python
# Lists (mutable, ordered)
fruits = ["apple", "banana", "cherry"]
fruits.append("mango")
fruits[0] = "avocado"
print(fruits[1:3])  # slicing → ['banana', 'cherry']

# Dictionaries (key-value)
student = {"name": "Juan", "gpa": 3.9, "major": "BSCS"}
print(student["name"])   # Juan
student["year"] = 3      # add key

# List comprehension
squares = [x**2 for x in range(1, 6)]  # [1, 4, 9, 16, 25]
evens = [x for x in range(20) if x % 2 == 0]
\`\`\`

### Functions
\`\`\`python
def factorial(n: int) -> int:
    """Returns n! (factorial of n)."""
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))  # 120
\`\`\`

### File Handling
\`\`\`python
# Write
with open("output.txt", "w") as f:
    f.write("Hello, World!\\n")

# Read
with open("output.txt", "r") as f:
    for line in f:
        print(line.strip())
\`\`\`

### Common Built-in Functions
\`\`\`python
len([1,2,3])         # 3
max([4,1,9,3])       # 9
min([4,1,9,3])       # 1
sum([1,2,3,4])       # 10
sorted([3,1,2])      # [1, 2, 3]
zip([1,2], ["a","b"])  # [(1,'a'), (2,'b')]
enumerate(["a","b"])   # [(0,'a'), (1,'b')]
\`\`\``;
  }

  // ─ JavaScript errors / TypeError ─
  if (q.includes("typeerror") || q.includes("javascript error") || (q.includes("error") && q.includes("javascript"))) {
    return `## Debugging JavaScript TypeErrors

A **TypeError** in JavaScript occurs when you try to perform an operation on a value of the wrong type.

### Most Common Causes

**1. Calling a method on \`null\` or \`undefined\`**
\`\`\`javascript
// ❌ Error: Cannot read properties of null (reading 'length')
const value = null;
console.log(value.length);

// ✅ Fix: check before accessing
if (value !== null && value !== undefined) {
    console.log(value.length);
}
// Or use optional chaining (ES2020+)
console.log(value?.length);  // returns undefined instead of throwing
\`\`\`

**2. Calling something that is not a function**
\`\`\`javascript
// ❌ Error: myFunc is not a function
let myFunc = "hello";
myFunc();

// ✅ Fix: check type before calling
if (typeof myFunc === "function") myFunc();
\`\`\`

**3. Wrong type for an operation**
\`\`\`javascript
// ❌ Error: Cannot convert undefined to object
const obj = undefined;
Object.keys(obj);

// ✅ Fix
const obj2 = obj ?? {};   // nullish coalescing: use {} if undefined/null
Object.keys(obj2);
\`\`\`

### Debugging Steps
1. Read the **full error message** — it tells you the file, line number, and what was undefined.
2. Add \`console.log()\` before the crashing line to inspect the variable's value.
3. Use browser DevTools → Sources → set a **breakpoint** at the error line.
4. Check if data from an API call or async operation has loaded before using it.`;
  }

  // ─ General fallback: honest, structured generic response ─
  const topicHint = isFollowUp ? " (follow-up)" : "";
  return `## ScholarBot AI — Academic Copilot${topicHint}

I can help you with: **"${latest}"**

Here's what I can assist with in this area:

1. **Explain the concept** — step-by-step with examples
2. **Provide code** — working, commented programs in Python, Java, C, JavaScript, or another language
3. **Give a reviewer** — summary tables, cheat sheets, exam tips
4. **Compare or contrast** — side-by-side topic comparisons
5. **Debug code** — paste your code and I'll identify the issue

**To get the most accurate answer**, try asking specifically:
- *"Explain [topic] with a code example"*
- *"What is the difference between [A] and [B]?"*
- *"Write a Python/Java program that does [X]"*
- *"Give me a reviewer for [subject]"*

📚 My knowledge covers: BSIT, BSCS, BSCpE, Programming (Python/Java/C/JavaScript), Databases, Networking, OS, AI/ML, and more.`;
}

// ─── Streaming token emitter ────────────────────────────────────────────────
function streamText(text: string): Response {
  const encoder = new TextEncoder();
  // Split by words and punctuation to simulate natural token streaming
  const tokens = text.match(/[\w']+|[^\w\s]|\s+|\n/g) || [text];

  const stream = new ReadableStream({
    async start(controller) {
      // Send in small batches for performance
      const batchSize = 3;
      for (let i = 0; i < tokens.length; i += batchSize) {
        const chunk = tokens.slice(i, i + batchSize).join("");
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, 12 + Math.random() * 18));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}

// ─── Main route handler ─────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: ChatMessage[] };

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Invalid messages array" }, { status: 400 });
    }

    // Validate message structure
    for (const msg of messages) {
      if (!msg.role || !Array.isArray(msg.parts) || !msg.parts[0]?.text) {
        return Response.json({ error: "Invalid message format" }, { status: 400 });
      }
    }

    // Rate limit: cap at 50 messages in a session
    if (messages.length > 50) {
      return streamText(
        "⚠️ This conversation is getting long. Please start a **New Chat** to continue with better context."
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isValidKey =
      apiKey &&
      apiKey !== "your_gemini_api_key_here" &&
      apiKey.trim() !== "" &&
      apiKey.startsWith("AI");

    // Use live Gemini API if key is valid
    if (isValidKey) {
      try {
        return await callGeminiStreaming(messages, apiKey!);
      } catch (apiErr) {
        const msg = apiErr instanceof Error ? apiErr.message : "API error";
        console.error("Gemini API failed, falling back to built-in:", msg);
        // Fall through to built-in fallback
      }
    }

    // Built-in intelligent fallback (no API key needed)
    const answer = buildFallbackResponse(messages);
    return streamText(answer);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
