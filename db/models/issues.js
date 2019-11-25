/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('issues', {
    'issue_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'issued_to': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_complete': {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      comment: "null"
    },
    '_date': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    '_date_due': {
      type: DataTypes.DATE,
      allowNull: false,
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
    tableName: 'issues'
  });
};
