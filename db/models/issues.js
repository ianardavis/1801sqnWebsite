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
    '_date': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('current_timestamp'),
      comment: "null"
    },
    '_date_due': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    '_filename': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    '_status': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
<<<<<<< HEAD
      defaultValue: 1,
=======
      defaultValue: '1',
>>>>>>> 5937bb909a9770fae4706124d4fcf7f050a032b0
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
      defaultValue: sequelize.fn('current_timestamp'),
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('current_timestamp'),
      comment: "null"
    }
  }, {
    tableName: 'issues'
  });
};
