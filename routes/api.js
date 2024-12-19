const express = require("express");
const router = express.Router();
const ApiController = require("../controller/ApiController");
const { upload } = require("../services/fileUpload");

router.get("/market", ApiController.getAll);
router.get("/market/:id", ApiController.getSingle);
router.post(
  "/market-multi",
  upload.single("jsonfile"),
  ApiController.multipleCreate
);
router.post("/get-stocks", ApiController.getStocks);
router.post("/get-stocks-subtypes", ApiController.getStockSubtypes);
router.post("/overview", ApiController.overViewList);
router.post("/update-market", ApiController.updateMarketData);
router.post("/market-search", ApiController.searchMarket);
router.post("/user-category", ApiController.searchMarket);
router.post("/news", ApiController.newsAll);
router.post("/news/:id", ApiController.newsSingle);
router.post("/user-tracking", ApiController.userTracking);
router.post("/feedback", upload.single("image"), ApiController.feedBack);
router.post("/top-stocks", ApiController.getTopStocks);
module.exports = router;
