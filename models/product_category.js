export default (sequelize, DataTypes) => {
  const ProductCategory = sequelize.define('product_category', {
    product_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    category_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    }
  }, {
    tableName: 'product_category',
    freezeTableName: true,
    timestamps: false
  });
  return ProductCategory;
}
