const { commonService } = require("../services/index");
const { renderPage } = require("./commonController");
const { feedback: FeedBackModal } = require("../models");

// Controller Methods
const index = async (req, res) => {
  try {
    const getData = await commonService.getAll(FeedBackModal, {
      attributes: [
        "id",
        "device_id",
        "title",
        "image",
        "description",
        "status",
      ],
      order: [["created_at", "DESC"]],
    });
    renderPage(req, res, "feedback/index", {
      title: "Feed Back",
      activePage: "feedback",
      getData,
    });
  } catch (error) {
    console.error("Error fetching feedback data:", error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteRecord = async (req, res) => {
  const id = req?.params?.id;
  if (!id) {
    return res.status(400).render("error", { error: "Bad Request" });
  }

  try {
    const dataCheck = await commonService.get(FeedBackModal, { where: { id } });

    if (!dataCheck) {
      return res
        .status(404)
        .send({ success: false, message: `Cannot find id=${id}.` });
    }

    const deleteData = await commonService.delete(FeedBackModal, {
      where: { id },
    });

    if (deleteData) {
      res.status(200).send({ success: true });
    } else {
      res.status(404).send({
        success: false,
        message: `Cannot Delete Data`,
      });
    }
  } catch (error) {
    console.error("deleteRecord=>", error.message);
    res.status(500).render("error", { error: "Internal Server Error" });
  }
};

module.exports = { index, deleteRecord };
