global.__basedir = __dirname;
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const port = 8000;
const ethRouter = require("./routes/eth");
const bitcoinRouter = require("./routes/bitcoin");
const mnemonicRouter = require("./routes/mnemonic");
const addressRouter = require("./routes/address");
const balanceRouter = require("./routes/balance");
const models = require("./models/");

const { Wallet, sequelize } = models;

// async function createWalletTable() {
//   try {
//     await Wallet.sync({ force: true }); // Use { force: true } to drop existing table and recreate
//     console.log("Wallet table created successfully");
//   } catch (error) {
//     console.error("Error creating Wallet table:", error);
//   } finally {
//     await sequelize.close(); // Close the Sequelize connection when done
//   }
// }
// createWalletTable();

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/eth", ethRouter);
app.use("/bitcoin", bitcoinRouter);
app.use("/mnemonic", mnemonicRouter);

app.use("/address", addressRouter);
app.use("/balance", balanceRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
