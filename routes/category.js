const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");

router.get("/", categoryController.index);
router.get("/create", categoryController.create);
router.post("/store", categoryController.store);
router.get("/:id", categoryController.show);
router.get("/:id/edit", categoryController.edit);
router.post("/:id/update", categoryController.update);
router.delete("/:id", categoryController.deleteRecord);

module.exports = router;
