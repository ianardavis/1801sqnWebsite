/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('demand_lines', {
    'line_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'demand_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'size_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'status': {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '1',
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
    tableName: 'demand_lines',
    schema: 'stores'
  });
};
