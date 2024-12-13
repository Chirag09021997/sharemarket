module.exports = (sequelize, Sequelize, DataTypes) => {
  const News = sequelize.define(
    "news",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      desc: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
    },
    {
      paranoid: true,
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );
  return News;
};
