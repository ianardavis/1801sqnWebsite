/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('demand_line_actions', {
    'action_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'demand_line_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_action': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'action_line_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'user_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'createdAt': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'demand_line_actions',
    schema: 'stores'
  });
};
