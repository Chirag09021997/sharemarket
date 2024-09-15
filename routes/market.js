const express = require("express");
const router = express.Router();
const marketController = require("../controller/marketController");
const { upload } = require("../services/fileUpload");

router.get("/", marketController.index);
router.get("/create", marketController.create);
router.post("/store", upload.single("image"), marketController.store);
router.get("/:id", marketController.show);
router.get("/:id/edit", marketController.edit);
router.post("/:id/update", upload.single("image"), marketController.update);
router.delete("/:id", marketController.deleteRecord);

module.exports = router;
