const { symbol } = require("joi");

module.exports = (sequelize, Sequelize, DataTypes) => {
  const Market = sequelize.define(
    "market",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      symbol: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      image_url: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      response: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      paranoid: true,
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Market;
};
