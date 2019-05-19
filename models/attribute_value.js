export default (sequelize, DataTypes) => {
  const AttributeValue = sequelize.define('attribute_value', {
    attribute_value_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    attribute_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    value: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'attribute_value',
    freezeTableName: true,
    timestamps: false
  });

  AttributeValue.associate = (models) => {
    AttributeValue.belongsToMany(models.product, {
      through: {
        model: models.product_attribute
      },
      foreignKey: 'attribute_value_id'
    });
    AttributeValue.belongsTo(models.attribute, {
      foreignKey: 'attribute_id'
    });
  };

  return AttributeValue;
};
