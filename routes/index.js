const express = require("express");
const router = express.Router();
const authController = require("../controller/authenticationController");
const { authCheck } = require("../middleware/auth.middleware");
const dashBoardController = require("../controller/dashBoardController");
const indicsController = require("../controller/indicsController");
const currenciesController = require("../controller/currenciesController");
const commoditiesController = require("../controller/commoditiesController");
const stockController = require("../controller/stockController");
const futuresController = require("../controller/futuresController");
const etfsController = require("../controller/etfsController");
const fundsController = require("../controller/fundsController");
const bondsController = require("../controller/bondsController");
const cryptoCurrencyController = require("../controller/cryptoCurrencyController");
const settingController = require("../controller/settingController");
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
router.use("/category", authCheck, require("./category"));
router.use("/news", authCheck, require("./news"));

router.get("/indics", authCheck, indicsController.index);
router.post("/indics/overview/:id", authCheck, indicsController.changeOverview);
router.get("/currencies", authCheck, currenciesController.index);
router.get("/commodities", authCheck, commoditiesController.index);
router.get("/stock", authCheck, stockController.index);
router.get("/cryptocurrency", authCheck, cryptoCurrencyController.index);
router.get("/futures", authCheck, futuresController.index);
router.get("/etfs", authCheck, etfsController.index);
router.get("/funds", authCheck, fundsController.index);
router.get("/bonds", authCheck, bondsController.index);
router.get("/setting", authCheck, settingController.index);
router.post("/setting", authCheck, settingController.update);
module.exports = router;
