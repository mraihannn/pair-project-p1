"use strict";
const { Model, Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { toRupiah } = require("../helpers/numberHelper");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.UserProfile, { foreignKey: "UserId" });

      // One-to-Many with Transaction
      User.hasMany(models.Transaction, {
        foreignKey: "UserId",
      });

      // User.belongsToMany(models.Category, { through: models.Transaction });
    }

    static async getUserWithProfileAndTransactions(userId, filter, search) {
      let transactionInclude = {
        model: sequelize.models.Transaction,
        include: { model: sequelize.models.Category },
      };

      if (filter) {
        transactionInclude.include.where = { type: filter };
      }
      if (search) {
        transactionInclude.include.where = {
          name: {
            [Op.iLike]: `%${search}%`,
          },
        };
      }

      return await this.findOne({
        where: { id: userId },
        include: [{ model: sequelize.models.UserProfile }, transactionInclude],
      });
    }

    static async getSummary(userId) {
      const user = await this.findOne({
        where: { id: userId },
        include: [
          {
            model: sequelize.models.Transaction,
            include: sequelize.models.Category,
          },
        ],
      });

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const incomeTransactions = user.Transactions.filter(
        (transaction) =>
          transaction.Category.type === "Income" &&
          new Date(transaction.date) >= oneMonthAgo
      );

      const expenseTransactions = user.Transactions.filter(
        (transaction) =>
          transaction.Category.type === "Expense" &&
          new Date(transaction.date) >= oneMonthAgo
      );

      const totalIncome = incomeTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );
      const totalExpense = expenseTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );

      let averageIncome = totalIncome / new Date().getDate();
      let averageExpense = totalExpense / new Date().getDate();

      let message = "";
      if (averageExpense > averageIncome) {
        message =
          "Your expenses are higher than your income. Consider saving more.";
      } else if (averageExpense < averageIncome) {
        message = "Your income is higher than your expenses. Good job!";
      } else message;
      averageExpense = toRupiah(averageExpense);
      averageIncome = toRupiah(averageIncome);

      return { averageIncome, averageExpense, message };
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: "Field email is required",
          },
          notEmpty: {
            msg: "Field email is required",
          },
          isEmail: {
            msg: "Must be valid email",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Field password is required",
          },
          notEmpty: {
            msg: "Field password is required",
          },
          len: {
            args: [8],
            msg: "Minimum password length is 8 characters",
          },
        },
      },
      role: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeCreate: (user) => {
          user.role = "user";
          const salt = bcrypt.genSaltSync(10);
          user.password = bcrypt.hashSync(user.password, salt);
        },
      },
    }
  );
  return User;
};
