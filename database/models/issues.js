/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('issues', {
    'issue_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'user_id_issue': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'size_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'qty': {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '1',
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
    },
    'loancard_line_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'order_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'issues',
    schema: 'stores'
  });
};
