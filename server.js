const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const redirectFile = path.join(__dirname, "redirect.json");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Route: Home - Redirects to saved URL
app.get("/", (req, res) => {
  fs.readFile(redirectFile, "utf8", (err, data) => {
    if (err) return res.send("No redirect URL has been set yet.");

    let url;
    try {
      url = JSON.parse(data).url;
    } catch (e) {
      return res.send("Invalid redirect data.");
    }

    if (!url) {
      return res.send(`
        <html>
          <head><title>No Redirect Set</title></head>
          <body>
            <p>No redirect URL is set. <a href="/admin.html">Set one here</a>.</p>
          </body>
        </html>
      `);
    }

    // Redirect using meta refresh
    res.send(`
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=${url}">
        </head>
        <body>
          
        </body>
      </html>
    `);
  });
});

app.get("/get-redirect", (req, res) => {
  fs.readFile(redirectFile, "utf8", (err, data) => {
    if (err) return res.json({ url: null });

    try {
      const parsed = JSON.parse(data);
      res.json({ url: parsed.url || null });
    } catch {
      res.json({ url: null });
    }
  });
});

// Route: Handle admin form POST
app.post("/set-redirect", (req, res) => {
  const newUrl = req.body.url && req.body.url.trim();

  if (!newUrl || !newUrl.startsWith("http")) {
    return res.send("Invalid URL. Must start with http or https.");
  }

  // Save new URL to file (replaces old one)
  fs.writeFile(redirectFile, JSON.stringify({ url: newUrl }), (err) => {
    if (err) {
      return res.send("Error saving URL.");
    }

    res.send(`
      <html>
        <body>
          <p>Redirect URL updated to: <a href="${newUrl}">${newUrl}</a></p>
          <p><a href="/">Go to Home Page</a></p>
          <p><a href="/admin.html">Back to Admin</a></p>
        </body>
      </html>
    `);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port", port));
