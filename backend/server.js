require("dotenv").config();
const dns = require("dns");

// Force IPv4 first in Node.js DNS resolution (prevents ENETUNREACH on cloud environments like Render)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const app = require("./app");
const connectDB = require("./config/db");

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});