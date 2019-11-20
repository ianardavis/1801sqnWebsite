/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('requests_l', {
    'line_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'request_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'stock_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_qty': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_status': {
      type: DataTypes.STRING(15),
      allowNull: false,
      comment: "null",
      defaultValue: "Pending"
    },
    '_action': {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: "null"
    },
    '_date_approved': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    'order_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'issue_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'approved_by': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
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
    tableName: 'requests_l'
  });
};
