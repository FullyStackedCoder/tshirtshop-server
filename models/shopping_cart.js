export default (sequelize, DataTypes) => {
  const ShoppingCart = sequelize.define('shopping_cart', {
    item_id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    cart_id: {
      type: DataTypes.CHAR(32),
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    attributes: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    buy_now: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1'
    },
    added_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'shopping_cart',
    freezeTableName: true,
    timestamps: false
  });

  ShoppingCart.associate = (models) => {
    ShoppingCart.belongsTo(models.product, {
      foreignKey: 'product_id'
    });
  }

  return ShoppingCart;
};
