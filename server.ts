import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SUBJECTS_FILE = path.join(DATA_DIR, "subjects.json");
const TOPICS_FILE = path.join(DATA_DIR, "topics.json");
const QUESTIONS_FILE = path.join(DATA_DIR, "questions.json");
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

app.use(cors());
app.use(express.json());

// Initialize Data
async function initData() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    const ensureFile = async (filePath: string, defaultData: any) => {
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
      }
    };

    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("123", 10);
    await ensureFile(USERS_FILE, [
      {
        id: "1",
        username: "admin",
        password: adminPassword,
        role: "admin",
        score: 0,
      },
      {
        id: "2",
        username: "huynguyen",
        password: userPassword,
        role: "admin",
        score: 100,
      }
    ]);

    // Define initial data structures
    const subjectsSeed = [
      { id: "s1", name: "Toán Học", level: "primary" },
      { id: "s2", name: "Tiếng Việt", level: "primary" },
      { id: "s3", name: "Tiếng Anh", level: "primary" },
    ];

    const topicsSeed: any[] = [];
    const questionsSeed: any[] = [];

    // Realistic content seeding
    const mockContent = [
      {
        sId: "s1", g: 1, name: "Phép Cộng & Trừ (Phạm vi 10)",
        theory: "Học sinh làm quen với các phép toán cộng và trừ cơ bản trong phạm vi số từ 0 đến 10. Đây là nền tảng quan trọng cho tư duy toán học.",
        example: "Ví dụ: 3 cộng 2 bằng 5; 7 trừ 4 bằng 3.",
        qs: [
          { q: "1 + 4 bằng mấy?", o: ["3", "4", "5", "6"], a: "5", e: "Khi thêm 4 đơn vị vào 1 ta được kết quả là 5." },
          { q: "8 - 3 bằng mấy?", o: ["4", "5", "6", "7"], a: "5", e: "Khi lấy 8 bớt đi 3 đơn vị ta còn lại 5." },
          { q: "Số nào lớn hơn 5 nhưng nhỏ hơn 7?", o: ["4", "5", "6", "8"], a: "6", e: "Số 6 là số nằm duy nhất giữa 5 và 7 trong tập hợp số tự nhiên." },
          { q: "Có 3 quả táo, mẹ cho thêm 2 quả nữa. Hỏi có tất cả mấy quả?", o: ["4 quả", "5 quả", "6 quả", "3 quả"], a: "5 quả", e: "Phép tính: 3 + 2 = 5 quả táo." }
        ]
      },
      {
        sId: "s1", g: 2, name: "Bảng Nhân 2 và 5",
        theory: "Bảng nhân là công cụ giúp tính toán nhanh các nhóm đồ vật lặp lại tương ứng.",
        example: "Ví dụ: 2 x 3 = 6 (có 3 nhóm, mỗi nhóm 2 cái).",
        qs: [
          { q: "2 x 5 bằng bao nhiêu?", o: ["7", "10", "12", "15"], a: "10", e: "Theo bảng nhân 2: 2 x 5 = 10." },
          { q: "5 x 4 bằng bao nhiêu?", o: ["9", "20", "25", "15"], a: "20", e: "Theo bảng nhân 5: 5 x 4 = 20." },
          { q: "2 x 9 bằng bao nhiêu?", o: ["18", "16", "20", "14"], a: "18", e: "Theo bảng nhân 2: 2 x 9 = 18." }
        ]
      },
      {
        sId: "s2", g: 1, name: "Âm và Chữ Cái Tiếng Việt",
        theory: "Bảng chữ cái tiếng Việt gồm các chữ cái đơn và các dấu thanh cơ bản để ghép thành tiếng.",
        example: "Các chữ: a, b, c, d... Dấu thanh: huyền, sắc, hỏi, ngã, nặng.",
        qs: [
          { q: "Chữ cái nào bắt đầu từ 'Con cá'?", o: ["k", "c", "q", "t"], a: "c", e: "Tiếng 'cá' bắt đầu bằng âm 'c'." },
          { q: "Trong từ 'mẹ', dấu thanh là dấu gì?", o: ["Sắc", "Huyền", "Nặng", "Hỏi"], a: "Nặng", e: "Dấu nặng nằm phía dưới chữ cái âm chính." },
          { q: "Từ nào có chứa âm 'a'?", o: ["Bàn", "Bút", "Cây", "Mưa"], a: "Bàn", e: "Từ 'Bàn' có âm 'a' ở giữa (B-a-n)." }
        ]
      },
      {
        sId: "s3", g: 1, name: "Greetings & Introduction",
        theory: "Learn how to say hello and introduce yourself nicely in English.",
        example: "Ex: 'Hello, my name is Huy. Nice to meet you!'",
        qs: [
          { q: "How do you answer to 'How are you?'", o: ["I am late", "I am fine, thank you", "I am ten", "Hello"], a: "I am fine, thank you", e: "This is the most common way to respond to a health wellness check." },
          { q: "Which one is a greeting?", o: ["Goodbye", "Morning", "Hello", "Night"], a: "Hello", e: "Hello is a standard greeting when meeting someone." }
        ]
      },
      {
        sId: "s3", g: 6, name: "Present Simple Tense",
        theory: "The present simple tense is used to describe facts or habits.",
        example: "Ex: 'He plays football every day.'",
        qs: [
          { q: "He ___ football on Sundays.", o: ["play", "playing", "plays", "played"], a: "plays", e: "With 3rd person singular subjects (He/She/It), add -s or -es to the verb." },
          { q: "They ___ like spicy food.", o: ["don't", "doesn't", "isn't", "aren't"], a: "don't", e: "Use 'don't' for plural subjects in negative present simple sentences." }
        ]
      }
    ];

    mockContent.forEach((item, idx) => {
      const tId = `topic_${idx}`;
      topicsSeed.push({
        id: tId,
        subjectId: item.sId,
        grade: item.g,
        name: item.name,
        theory: item.theory,
        example: item.example
      });

      item.qs.forEach((q, qIdx) => {
        questionsSeed.push({
          id: `q_${tId}_${qIdx}`,
          topicId: tId,
          question: q.q,
          options: q.o,
          correctAnswer: q.a,
          explanation: q.e
        });
      });
    });

    await ensureFile(SUBJECTS_FILE, subjectsSeed);
    await ensureFile(TOPICS_FILE, topicsSeed);
    await ensureFile(QUESTIONS_FILE, questionsSeed);

    // Ensure scores file exists too if needed
    const LEADERBOARD_FILE = path.join(DATA_DIR, "leaderboard.json"); // Just in case although leaderboard logic reads from users
    await ensureFile(LEADERBOARD_FILE, []);

    console.log("Data initialized successfully.");
  } catch (error) {
    console.error("Error initializing data:", error);
  }
}

// Helper to read/write JSON
async function readData(file: string) {
  const data = await fs.readFile(file, "utf-8");
  return JSON.parse(data);
}

async function writeData(file: string, data: any) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
};

// API Routes
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await readData(USERS_FILE);
    if (users.find((u: any) => u.username === username)) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      role: "user",
      score: 0,
    };
    users.push(newUser);
    await writeData(USERS_FILE, users);
    res.json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await readData(USERS_FILE);
    const user = users.find((u: any) => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, score: user.score } });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/subjects", async (req, res) => {
  try {
    const subjects = await readData(SUBJECTS_FILE);
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/topics/:subjectId", async (req: any, res) => {
  try {
    const topics = await readData(TOPICS_FILE);
    res.json(topics.filter((t: any) => t.subjectId === req.params.subjectId));
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/questions/:topicId", async (req: any, res) => {
  try {
    const questions = await readData(QUESTIONS_FILE);
    res.json(questions.filter((q: any) => q.topicId === req.params.topicId));
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/update-score", authenticateToken, async (req: any, res) => {
  try {
    const { points } = req.body;
    const users = await readData(USERS_FILE);
    const userIndex = users.findIndex((u: any) => u.id === req.user.id);
    if (userIndex !== -1) {
      users[userIndex].score += points;
      await writeData(USERS_FILE, users);
      res.json({ score: users[userIndex].score });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/leaderboard", async (req: any, res) => {
  try {
    const users = await readData(USERS_FILE);
    const board = users
      .map((u: any) => ({ username: u.username, score: u.score }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 10);
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Admin Routes
app.post("/api/admin/subjects", authenticateToken, isAdmin, async (req: any, res) => {
    try {
        console.log(`Admin ${req.user.username} is adding subject:`, req.body);
        const subjects = await readData(SUBJECTS_FILE);
        const newSubject = { id: Date.now().toString(), ...req.body };
        subjects.push(newSubject);
        await writeData(SUBJECTS_FILE, subjects);
        res.json(newSubject);
    } catch (error) {
        console.error("Add subject error:", error);
        res.status(500).json({ error: "Failed to add subject" });
    }
});

app.put("/api/admin/subjects/:id", authenticateToken, isAdmin, async (req: any, res) => {
    try {
        const subjects = await readData(SUBJECTS_FILE);
        const index = subjects.findIndex((s: any) => s.id === req.params.id);
        if (index !== -1) {
            subjects[index] = { ...subjects[index], ...req.body };
            await writeData(SUBJECTS_FILE, subjects);
            res.json(subjects[index]);
        } else {
            res.status(404).json({ error: "Not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update subject" });
    }
});

app.delete("/api/admin/subjects/:id", authenticateToken, isAdmin, async (req: any, res) => {
    try {
        console.log(`Admin ${req.user.username} is deleting subject: ${req.params.id}`);
        const subjects = await readData(SUBJECTS_FILE);
        const topics = await readData(TOPICS_FILE);
        const questions = await readData(QUESTIONS_FILE);

        // Deep delete: Subject -> Topics -> Questions
        const filteredSubjects = subjects.filter((s: any) => s.id !== req.params.id);
        
        // Find topics to delete to find questions to delete
        const deletedTopics = topics.filter((t: any) => t.subjectId === req.params.id);
        const deletedTopicIds = deletedTopics.map((t: any) => t.id);
        
        const filteredTopics = topics.filter((t: any) => t.subjectId !== req.params.id);
        const filteredQuestions = questions.filter((q: any) => !deletedTopicIds.includes(q.topicId));

        await writeData(SUBJECTS_FILE, filteredSubjects);
        await writeData(TOPICS_FILE, filteredTopics);
        await writeData(QUESTIONS_FILE, filteredQuestions);

        console.log(`Deleted subject ${req.params.id}, ${deletedTopicIds.length} topics, and associated questions.`);
        res.json({ message: "Deleted subject and all nested content" });
    } catch (error) {
        console.error("Delete subject error:", error);
        res.status(500).json({ error: "Failed to delete subject" });
    }
});

app.post("/api/admin/topics", authenticateToken, isAdmin, async (req: any, res) => {
    const topics = await readData(TOPICS_FILE);
    const newTopic = { id: Date.now().toString(), ...req.body };
    topics.push(newTopic);
    await writeData(TOPICS_FILE, topics);
    res.json(newTopic);
});

app.put("/api/admin/topics/:id", authenticateToken, isAdmin, async (req: any, res) => {
    const topics = await readData(TOPICS_FILE);
    const index = topics.findIndex((t: any) => t.id === req.params.id);
    if (index !== -1) {
        topics[index] = { ...topics[index], ...req.body };
        await writeData(TOPICS_FILE, topics);
        res.json(topics[index]);
    } else {
        res.status(404).json({ error: "Not found" });
    }
});

app.delete("/api/admin/topics/:id", authenticateToken, isAdmin, async (req: any, res) => {
    const topics = await readData(TOPICS_FILE);
    const questions = await readData(QUESTIONS_FILE);

    const filteredTopics = topics.filter((t: any) => t.id !== req.params.id);
    const filteredQuestions = questions.filter((q: any) => q.topicId !== req.params.id);

    await writeData(TOPICS_FILE, filteredTopics);
    await writeData(QUESTIONS_FILE, filteredQuestions);

    res.json({ message: "Deleted topic and its questions" });
});

app.post("/api/questions", authenticateToken, isAdmin, async (req: any, res) => {
  const questions = await readData(QUESTIONS_FILE);
  const newQuestion = { id: Date.now().toString(), ...req.body };
  questions.push(newQuestion);
  await writeData(QUESTIONS_FILE, questions);
  res.json(newQuestion);
});

app.put("/api/questions/:id", authenticateToken, isAdmin, async (req: any, res) => {
  const questions = await readData(QUESTIONS_FILE);
  const index = questions.findIndex((q: any) => q.id === req.params.id);
  if (index !== -1) {
    questions[index] = { ...questions[index], ...req.body };
    await writeData(QUESTIONS_FILE, questions);
    res.json(questions[index]);
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

app.delete("/api/questions/:id", authenticateToken, isAdmin, async (req: any, res) => {
  const questions = await readData(QUESTIONS_FILE);
  const filtered = questions.filter((q: any) => q.id !== req.params.id);
  await writeData(QUESTIONS_FILE, filtered);
  res.json({ message: "Deleted" });
});

async function start() {
  await initData();
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
