const express = require("express");
const router = express.Router();
const newsController = require("../controller/newsController");
const { upload } = require("../services/fileUpload");

router.get("/", newsController.index);
router.get("/create", newsController.create);
router.post("/store", upload.single("image"), newsController.store);
router.get("/:id/edit", newsController.edit);
router.post("/:id/update", upload.single("image"), newsController.update);
router.delete("/:id", newsController.deleteRecord);
router.get("/:id", newsController.show);

module.exports = router;
