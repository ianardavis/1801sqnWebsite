/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('issue_loancard_lines', {
    'issue_loancard_line_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'issue_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'line_id': {
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
    tableName: 'issue_loancard_lines',
    schema: 'stores'
  });
};
