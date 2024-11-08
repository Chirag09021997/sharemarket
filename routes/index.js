const express = require("express");
const router = express.Router();
const authController = require("../controller/authenticationController");
const { authCheck } = require("../middleware/auth.middleware");
const dashBoardController = require("../controller/dashBoardController");
const indicsController = require("../controller/indicsController");
const currenciesController = require("../controller/currenciesController");
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
router.get("/indics", authCheck, indicsController.index);
router.post("/indics/overview/:id", authCheck, indicsController.changeOverview);
router.get("/currencies", authCheck, currenciesController.index);
module.exports = router;
