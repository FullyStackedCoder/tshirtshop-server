export default (sequelize, DataTypes) => {
  const Attribute = sequelize.define('attribute', {
    attribute_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'attribute',
    freezeTableName: true,
    timestamps: false
  });

  Attribute.associate = (models) => {
    Attribute.hasMany(models.attribute_value, {
      foreignKey: "attribute_id"
    });
  }

  return Attribute;
};
