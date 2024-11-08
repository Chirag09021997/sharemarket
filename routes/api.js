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
module.exports = router;
