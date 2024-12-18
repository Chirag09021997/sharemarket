module.exports = (sequelize, Sequelize, DataTypes) => {
  const Tracking = sequelize.define(
    "tracking",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      device_id: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      promotion_type: {
        type: DataTypes.ENUM("organic", "paid", "none"),
        defaultValue: "none",
      },
      country_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      total_open: {
        type: DataTypes.INTEGER,
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
  return Tracking;
};
