const express = require("express");
const router = express.Router();
const ApiController = require("../controller/ApiController");

router.get("/market", ApiController.getAll);
router.get("/market/:id", ApiController.getSingle);
module.exports = router;
