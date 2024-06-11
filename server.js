global.__basedir = __dirname;
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const port = 8000;
const balanceRouter = require("./routes/balance");
const walletRouter = require("./routes/walletCreation");
const withdrawRouter = require("./routes/withdraw");
const bitcoinRouter = require("./routes/bitcoinWallet");
const mnemonicRouter = require("./routes/btcmnemonic");
const btcbalRouter = require("./routes/btcBalance");
const models = require("./models/");

const { BitcoinWallets, sequelize } = models;

// async function createWalletTable() {
//   try {
//     await BitcoinWallets.sync({ force: true }); // Use { force: true } to drop existing table and recreate
//     console.log("BitcoinWallets table created successfully");
//   } catch (error) {
//     console.error("Error creating BitcoinWallets table:", error);
//   } finally {
//     await sequelize.close(); // Close the Sequelize connection when done
//   }
// }
// createWalletTable();

// app.get("/balance", (req, res) => {
//   res.send("Hello, World!");
// });

app.use("/balance", balanceRouter);
app.use("/createWallet", walletRouter);
app.use("/withdraw", withdrawRouter);
app.use("/bitcoin", bitcoinRouter);
app.use("/mnemonic", mnemonicRouter);
app.use("/btc-balance", btcbalRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
