const express = require("express");
const router = express.Router();
const authController = require("../controller/authenticationController");
const { authCheck } = require("../middleware/auth.middleware");
const dashBoardController = require("../controller/dashBoardController");

/* GET home page. */
router.get("/", authCheck, (req, res) => {
  res.redirect("/dashboard");
});

router
  .route("/register")
  .get(authController.getRegister)
  .post(authController.register);
router.route("/login").get(authController.getLogin).post(authController.login);
router.get("/logout", authCheck, authController.logout);

router.get("/dashboard", authCheck, dashBoardController.dashboard);
router.use("/market", authCheck, require("./market"));
module.exports = router;
