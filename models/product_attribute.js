export default (sequelize, DataTypes) => {
  const ProductAttribute = sequelize.define('product_attribute', {
    product_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    attribute_value_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    }
  }, {
    tableName: 'product_attribute',
    freezeTableName: true,
    timestamps: false
  });
  return ProductAttribute;
}
