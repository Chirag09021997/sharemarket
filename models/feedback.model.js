module.exports = (sequelize, Sequelize, DataTypes) => {
  const FeedBack = sequelize.define(
    "feedback",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      device_id: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
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
  return FeedBack;
};
