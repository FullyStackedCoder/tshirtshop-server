export default (sequelize, DataTypes) => {
  const ShippingRegion = sequelize.define(
    "shipping_region",
    {
      shipping_region_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      shipping_region: {
        type: DataTypes.STRING(100),
        allowNull: false
      }
    },
    {
      tableName: "shipping_region",
      freezeTableName: true,
      timestamps: false
    }
  );

  return ShippingRegion;
};
