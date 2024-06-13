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
const models = require("./models/");

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

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/eth", ethRouter);
app.use("/bitcoin", bitcoinRouter);
app.use("/mnemonic", mnemonicRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
