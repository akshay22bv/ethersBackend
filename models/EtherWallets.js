"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class EtherWallets extends Model {
    static associate(models) {
      this.hasOne(models.Mnemonics, {
        foreignKey: "id",
        sourceKey: "mnemonic",
      });
    }
  }
  EtherWallets.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },

      privateKey: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      publicKey: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      mnemonic: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      path: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      balance: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },

      createdAt: {
        type: DataTypes.DATE,
        defaultValue: Date.now(),
      },

      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: Date.now(),
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "EtherWallets",
      tableName: "EtherWallets",
      deletedAt: "deletedAt",
      timestamps: true,
      paranoid: true,
    }
  );
  return EtherWallets;
};
