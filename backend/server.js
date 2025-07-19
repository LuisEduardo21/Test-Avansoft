const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database(":memory:");
const SECRET_KEY = "your-secret-key";

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    birthdate TEXT
  )`);

  db.run(`CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    sale_date TEXT,
    amount REAL,
    FOREIGN KEY(client_id) REFERENCES clients(id)
  )`);
});

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// User registration
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      function (err) {
        if (err) return res.status(400).json({ error: "User already exists" });
        res.status(201).json({ message: "User created" });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// User login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err || !user)
        return res.status(401).json({ error: "Invalid credentials" });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword)
        return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      res.json({ token });
    }
  );
});

// CRUD operations for clients
app.post("/api/clients", authenticateToken, (req, res) => {
  const { name, email, birthdate } = req.body;
  db.run(
    "INSERT INTO clients (name, email, birthdate) VALUES (?, ?, ?)",
    [name, email, birthdate],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.get("/api/clients", authenticateToken, (req, res) => {
  const { name, email } = req.query;
  let query = "SELECT * FROM clients";
  let params = [];

  if (name || email) {
    query += " WHERE";
    if (name) {
      query += " name LIKE ?";
      params.push(`%${name}%`);
    }
    if (email) {
      query += name ? " AND email LIKE ?" : " email LIKE ?";
      params.push(`%${email}%`);
    }
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      data: {
        clientes: rows.map((row) => ({
          info: {
            nomeCompleto: row.name,
            detalhes: {
              email: row.email,
              nascimento: row.birthdate,
            },
          },
          estatisticas: {
            vendas: [], // Simplified for demo
          },
        })),
      },
      meta: {
        registroTotal: rows.length,
        pagina: 1,
      },
      redundante: { status: "ok" },
    });
  });
});

app.put("/api/clients/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, email, birthdate } = req.body;
  db.run(
    "UPDATE clients SET name = ?, email = ?, birthdate = ? WHERE id = ?",
    [name, email, birthdate, id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: "Client not found" });
      res.json({ message: "Client updated" });
    }
  );
});

app.delete("/api/clients/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM clients WHERE id = ?", [id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "Client not found" });
    res.json({ message: "Client deleted" });
  });
});

// Sales routes
app.post("/api/sales", authenticateToken, (req, res) => {
  const { client_id, sale_date, amount } = req.body;
  db.run(
    "INSERT INTO sales (client_id, sale_date, amount) VALUES (?, ?, ?)",
    [client_id, sale_date, amount],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Statistics routes
app.get("/api/stats/daily-sales", authenticateToken, (req, res) => {
  db.all(
    "SELECT sale_date, SUM(amount) as total FROM sales GROUP BY sale_date",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.get("/api/stats/top-clients", authenticateToken, (req, res) => {
  const queries = {
    highestVolume:
      "SELECT c.id, c.name, SUM(s.amount) as total FROM clients c JOIN sales s ON c.id = s.client_id GROUP BY c.id ORDER BY total DESC LIMIT 1",
    highestAverage:
      "SELECT c.id, c.name, AVG(s.amount) as avg FROM clients c JOIN sales s ON c.id = s.client_id GROUP BY c.id ORDER BY avg DESC LIMIT 1",
    mostFrequent:
      "SELECT c.id, c.name, COUNT(DISTINCT s.sale_date) as days FROM clients c JOIN sales s ON c.id = s.client_id GROUP BY c.id ORDER BY days DESC LIMIT 1",
  };

  const results = {};
  const queryKeys = Object.keys(queries);

  const runQuery = (index) => {
    if (index >= queryKeys.length) {
      return res.json(results);
    }

    db.get(queries[queryKeys[index]], [], (err, row) => {
      if (!err && row) {
        results[queryKeys[index]] = row;
      }
      runQuery(index + 1);
    });
  };

  runQuery(0);
});

app.listen(3000, () => console.log("Server running on port 3000"));
