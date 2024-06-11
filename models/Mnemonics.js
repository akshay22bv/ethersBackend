// Import necessary modules
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Mnemonics extends Model {} // Define a new model for generating mnemonic
  Mnemonics.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      mnemonic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Mnemonics",
      tableName: "Mnemonics",
      timestamps: true,
      paranoid: true,
    }
  );
  return Mnemonics;
};
