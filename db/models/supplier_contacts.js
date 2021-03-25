/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('supplier_contacts', {
    'supplier_contact_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'supplier_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'contact_id': {
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
    tableName: 'supplier_contacts',
    schema: 'stores'
  });
};
