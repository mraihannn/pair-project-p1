"use strict";
const { Model } = require("sequelize");
const { toRupiah } = require("../helpers/numberHelper");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction.belongsTo(models.User, { foreignKey: "UserId" });
      // Belongs to Category
      Transaction.belongsTo(models.Category, {
        foreignKey: "CategoryId",
      });
    }

    get amountRupiah() {
      return toRupiah(this.amount);
    }
  }
  Transaction.init(
    {
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Field type is required",
          },
          notEmpty: {
            msg: "Field type is required",
          },
        },
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Field Date is required",
          },
          notEmpty: {
            msg: "Field Date is required",
          },
        },
      },
      UserId: DataTypes.INTEGER,
      CategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Field Category is required",
          },
          notEmpty: {
            msg: "Field Category is required",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Transaction",
    }
  );
  return Transaction;
};
