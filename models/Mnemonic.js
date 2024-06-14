// Import necessary modules
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Mnemonic extends Model {
    static associate(models) {
      this.hasMany(models.WalletAddress, {
        foreignKey: 'walletId',
        sourceKey: 'walletId',
      });
    }
  } // Define a new model for generating mnemonic
  Mnemonic.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      walletId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      walletName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mnemonic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      privateKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      publicKey: {
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
      modelName: 'Mnemonic',
      tableName: 'Mnemonic',
      timestamps: true,
      paranoid: true,
    }
  );
  return Mnemonic;
};
