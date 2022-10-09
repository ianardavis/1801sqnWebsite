/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('adjustments', {
    'adjustment_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'size_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'stock_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'type': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'qty': {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "null"
    },
    'variance': {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "null"
    },
    'user_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'createdAt': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'adjustments',
    schema: 'stores'
  });
};
