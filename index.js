const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const crypto = require("crypto");
const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "llaima",
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

const getHash = (string) => {
  return crypto.createHash("md5").update(string).digest("hex");
};

const query = async (q) => {
  const p = await new Promise((resolve, reject) => {
    db.query(q, function (err, result) {
      if (err) throw reject(err);
      resolve(result);
    });
  });
  return p;
};

//Subscribe a user
app.post("/subscribe", async (req, res) => {
  const email = req.body["email"];
  const hash = getHash(email);
  if (email === "" || email === undefined) {
    res.send({
      message: "Email field is required",
      success: true,
      code: "REQUIRED",
    });
    return;
  }

  const exists = await query(
    `SELECT * from subscriptions WHERE email = '${email}'`
  );
  if (exists && exists.length === 0) {
    const insert = await query(
      `INSERT INTO subscriptions (email, is_subscribed, hash) VALUES ('${email}', true, '${hash}')`
    );
    if (insert) {
      res.send({
        message: "Subscribed Successfully.",
        success: true,
        code: "SUBSCRIBED",
      });
    } else {
      res.send({
        success: false,
      });
    }
  } else {
    res.send({
      message: "Email already exists",
      success: true,
      code: "EXISTS",
    });
  }
});
//Un-Subscribe a user
app.get("/:hash/unsubscribe", async (req, res) => {
  const hash = req.params["hash"];
  const exists = await query(
    `SELECT * from subscriptions WHERE hash = '${hash}'`
  );

  if (exists && exists.length === 1) {
    const update = await query(
      `UPDATE subscriptions SET is_subscribed = false WHERE hash = '${hash}'`
    );
    if (update) {
      res.send({
        message: "Unsubscribed successfully ",
        success: true,
        code: "SUCCESS",
      });
    } else {
      res.send({
        success: false,
      });
    }
  } else {
    res.send({
      message: "Unable to unsubscribe",
      success: true,
      code: "NOT EXISTS",
    });
  }
});
//Create a blog
app.post("/blog", (req, res) => {
  const title = req.body["title"];
  const desc = req.body["description"];
  const tags = req.body["tags"];
  const image = req.body["image"];
  const date = parseInt(new Date().getTime());

  if (
    title === undefined ||
    title === "" ||
    desc === undefined ||
    desc === "" ||
    tags === undefined ||
    tags === "" ||
    image === undefined ||
    image === ""
  ) {
    res.send({
      message: "All fields are required",
      success: true,
      code: "REQUIRED",
    });
    return;
  }

  const insert = query(
    `INSERT INTO blog (title, description, image, tags, created_at) VALUES ('${title}','${desc}','${image}','${tags}',${date})`
  );

  res.send({ message: "Blog created", success: true, code: "CREATED" });
});

//Update a blog

//Delete a blog

app.listen(3001, function () {
  console.log("listening on 3001");
});
