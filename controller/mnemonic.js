const bip39 = require("bip39");
const models = require("../models/index");

const { Mnemonics } = models;

async function createMnemonic(req, res) {
  try {
    const mno = bip39.generateMnemonic();
    const mnemonic = await Mnemonics.create({ mnemonic: mno });
    res.json({ message: "success", body: { mnemonic } });
  } catch (error) {
    console.log("error: ", error);
    throw new Error("Mnemonic creation failed");
  }
}

async function getMnemonics(req, res) {
  try {
    const mnemonics = await Mnemonics.findAll({});
    res.json({ message: "success", body: { mnemonics } });
  } catch (error) {
    console.log("error: ", error);
    throw new Error("Mnemonic fetch failed");
  }
}

module.exports = {
  createMnemonic,
  getMnemonics,
};
