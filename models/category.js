export default (sequelize, DataTypes) => {
  const Category = sequelize.define('category', {
    category_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    department_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true
    }
  }, {
    tableName: 'category',
    freezeTableName: true,
    timestamps: false
  });

  Category.associate = (models) => {
    Category.belongsToMany(models.product, {
      through: {
        model: models.product_category
      },
      foreignKey: 'category_id'
    });
    Category.belongsTo(models.department, {
      foreignKey: 'department_id'
    });
  }

  return Category;
}
