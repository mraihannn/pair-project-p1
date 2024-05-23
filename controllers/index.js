const { User, Category, Transaction, UserProfile } = require("../models");
const bcrypt = require("bcryptjs");
const PDFDocument = require("pdfkit");
const fs = require("fs");

class Controller {
  static home(req, res) {
    res.render("Home");
  }

  static getRegister(req, res) {
    try {
      res.render("Register", { error: req.query.error });
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }

  static async postRegister(req, res) {
    const { email, password } = req.body;
    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        // Jika email sudah ada, kirim pesan kesalahan
        res.redirect(`/register?error=Email already in use`);
        return;
      }

      await User.create({ email, password });
      res.redirect("/login");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        res.redirect(`/register?error=${error.errors.map((e) => e.message)}`);
      } else {
        console.log(error);
        res.send(error.message);
      }
    }
  }

  static getLogin(req, res) {
    try {
      res.render("Login", { error: req.query.error });
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }

  static async postLogin(req, res) {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (user) {
        if (bcrypt.compareSync(password, user.password)) {
          req.session.user = {
            id: user.id,
            role: user.role,
          };
          res.redirect("/dashboard");
        } else {
          res.redirect(`/login?error=Username or password is not correct`);
        }
      } else {
        res.redirect(`/login?error=Username or password is not correct`);
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        res.redirect(`/login?error=${error.errors.map((e) => e.message)}`);
      } else {
        console.log(error);
        res.send(error.message);
      }
    }
  }

  static async getDashboard(req, res) {
    const { filter, search } = req.query;

    try {
      const user = await User.getUserWithProfileAndTransactions(
        req.session.user.id,
        filter,
        search
      );

      const summary = await User.getSummary(req.session.user.id);

      res.render("Dashboard", { user, summary });
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }

  static async downloadReport(req, res) {
    try {
      const user = await User.getUserWithProfileAndTransactions(
        req.session.user.id
      );
      const summary = await User.getSummary(req.session.user.id);
      const doc = new PDFDocument();

      let filename = `report-${user.id}.pdf`;
      filename = encodeURIComponent(filename);

      // Setup response headers
      res.setHeader(
        "Content-disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-type", "application/pdf");

      // Pipe the PDF into the response
      doc.pipe(res);

      // Add document content
      doc.fontSize(25).text("Transaction Report", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(18)
        .text(
          `User: ${user.UserProfile ? user.UserProfile.fullName : user.email}`,
          { align: "left" }
        );
      doc.moveDown();
      doc
        .fontSize(12)
        .text(`Generated on: ${new Date().toLocaleDateString()}`, {
          align: "left",
        });

      doc.moveDown();
      doc.text("Transactions:", { underline: true });

      user.Transactions.forEach((transaction) => {
        doc.moveDown();
        doc.text(`Amount: ${transaction.amountRupiah}`, { align: "left" });
        doc.text(`Category: ${transaction.Category.name}`, { align: "left" });
        doc.text(`Type: ${transaction.Category.type}`, { align: "left" });
        doc.text(`Date: ${transaction.date.toDateString()}`, { align: "left" });
      });

      // Add summary section
      doc.moveDown();
      doc.text("Summary:", { underline: true });
      doc.moveDown();
      doc.text(`Average Income per day: ${summary.averageIncome}`, {
        align: "left",
      });
      doc.text(`Average Expense per day: ${summary.averageExpense}`, {
        align: "left",
      });
      doc.text(summary.message, { align: "left" });

      // Finalize the PDF and end the stream
      doc.end();
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await User.findOne({
        where: { id: req.session.user.id },
        include: { model: UserProfile },
      });
      res.render("Profile", { user });
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }

  static async postProfile(req, res) {
    const { fullName, dateOfBirth, address } = req.body;
    try {
      let userProfile = await UserProfile.findOne({
        where: { UserId: req.session.user.id },
      });

      if (userProfile) {
        await userProfile.update({ fullName, dateOfBirth, address });
      } else {
        await UserProfile.create({
          fullName,
          dateOfBirth,
          address,
          UserId: req.session.user.id,
        });
      }

      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }

  static async getAddTransaction(req, res) {
    try {
      const categories = await Category.findAll();
      res.render("AddTransaction", { categories });
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }

  static async postAddTransaction(req, res) {
    const { amount, date, CategoryId } = req.body;
    try {
      await Transaction.create({
        amount,
        date,
        CategoryId,
        UserId: req.session.user.id,
      });
      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }

  static async getCategories(req, res) {
    try {
      const categories = await Category.findAll();
      res.render("Categories", { categories });
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }

  static getAddCategory(req, res) {
    res.render("AddCategory");
  }

  static async postAddCategory(req, res) {
    const { name, type } = req.body;
    try {
      await Category.create({ name, type });
      res.redirect("/categories");
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }

  static async logout(req, res) {
    try {
      req.session.destroy();
      res.redirect("/login");
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }

  // Admin: Get all users
  static async getAdminUsers(req, res) {
    try {
      const users = await User.findAll({
        order: [["id"]],
      });
      const { message } = req.query;
      res.render("AdminUsers", {
        users,
        message,
        currentUser: req.session.user,
      });
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }

  // Admin: Update user role
  static async updateUserRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;
    try {
      await User.update(
        { role },
        {
          where: { id },
        }
      );
      res.redirect("/admin/users");
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }

  // Admin: Delete user
  static async deleteUser(req, res) {
    const { id } = req.params;
    try {
      const user = await User.findOne({ where: { id } });

      await Transaction.destroy({
        where: { UserId: id },
      });

      await UserProfile.destroy({
        where: { UserId: id },
      });

      await user.destroy();
      res.redirect(
        `/admin/users?message=User with email ${user.email} has been removed`
      );
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }
}
module.exports = Controller;
