export default (sequelize, DataTypes) => {
  const Orders = sequelize.define('orders', {
    order_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    total_amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: '0.00'
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    shipped_on: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    comments: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    customer_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    auth_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    reference: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    shipping_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    tax_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'orders',
    freezeTableName: true,
    timestamps: false
  });

  Orders.associate = (models) => {
    Orders.hasMany(models.order_detail, {
      foreignKey: "order_id"
    })
  }

  return Orders;
};
