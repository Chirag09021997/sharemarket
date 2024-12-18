const { Sequelize, DataTypes, Op } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
    timezone: "+05:30",
  }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.admins = require("./admin.model")(sequelize, Sequelize, DataTypes);
db.market = require("./market.model")(sequelize, Sequelize, DataTypes);
db.category = require("./category.model")(sequelize, Sequelize, DataTypes);
db.news = require("./news.model")(sequelize, Sequelize, DataTypes);
db.tracking = require("./tracking.model")(sequelize, Sequelize, DataTypes);

// relationShip
db.news.belongsTo(db.category, { foreignKey: "category_id", as: "categories" });
module.exports = db;
