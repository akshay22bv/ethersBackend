global.__basedir = __dirname;
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const port = 5000;
const balanceRouter = require("./routes/balance");
const walletRouter = require("./routes/walletCreation");
const withdrawRouter = require("./routes/withdraw");
const models = require("./models/index");

const { EtherWallets, sequelize } = models;

// async function createWalletTable() {
//   try {
//     await EtherWallets.sync({ force: true }); // Use { force: true } to drop existing table and recreate
//     console.log("EtherWallets table created successfully");
//   } catch (error) {
//     console.error("Error creating EtherWallets table:", error);
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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
