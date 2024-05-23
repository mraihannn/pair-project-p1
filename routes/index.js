const Controller = require("../controllers");

const router = require("express").Router();

// Landing page route
router.get("/", Controller.home);

// Registration and login routes
router.get("/register", Controller.getRegister);
router.post("/register", Controller.postRegister);
router.get("/login", Controller.getLogin);
router.post("/login", Controller.postLogin);

// Middleware to check if user is logged in
router.use((req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
});

// Dashboard route
router.get("/dashboard", Controller.getDashboard);
router.get("/download-report", Controller.downloadReport);
router.get("/logout", Controller.logout);

// Profile routes
router.get("/profile", Controller.getProfile);
router.post("/profile", Controller.postProfile);

// Add Transaction routes
router.get("/transactions/new", Controller.getAddTransaction);
router.post("/transactions/new", Controller.postAddTransaction);

// Category routes
router.get("/categories", Controller.getCategories);
router.get("/categories/new", Controller.getAddCategory);
router.post("/categories/new", Controller.postAddCategory);

// Middleware to check if user is admin
router.use((req, res, next) => {
  if (req.session.user.role === "admin") {
    next();
  } else {
    res.redirect("/dashboard");
  }
});

// Admin routes
router.get("/admin/users", Controller.getAdminUsers);
router.post("/admin/users/:id/role", Controller.updateUserRole);
router.post("/admin/users/:id/delete", Controller.deleteUser);

module.exports = router;
