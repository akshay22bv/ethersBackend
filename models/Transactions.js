"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Transactions extends Model {
    static associate(models) {
      //   this.belongsTo(models.Mnemonic, {
      //     foreignKey: 'walletId',
      //     targetKey: 'walletId',
      //   });
    }
  }
  Transactions.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      assetId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transactiontype: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transactionHash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fromAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      toAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fee: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Transactions",
      tableName: "Transactions",
      deletedAt: "deletedAt",
      timestamps: true,
      paranoid: true,
    }
  );
  return Transactions;
};
