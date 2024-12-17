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
        unique: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      industry: {
        type: DataTypes.STRING,
        allowNull: true,
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
      type: {
        type: DataTypes.ENUM(
          "stock",
          "indics",
          "commodities",
          "currencies",
          "cryptocurrency",
          "futures",
          "etfs",
          "funds",
          "bonds"
        ),
        defaultValue: "stock",
      },
      subtype: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      overview: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      name: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      market_type: {
        type: DataTypes.ENUM("US", "EU", "ASIA", "None"),
        defaultValue: "None",
      },
      regular_market_price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      previous_close: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
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
