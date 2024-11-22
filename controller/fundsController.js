const { commonService } = require("../services/index");
const { renderPage } = require("./commonController");
const { market: MarketModel } = require("../models");

// Controller Methods
const index = async (req, res) => {
  try {
    const getData = await commonService.getAll(MarketModel, {
      attributes: [
        "id",
        "symbol",
        "image",
        "image_url",
        "country",
        "industry",
        "response",
        "type",
        "subtype",
        "overview",
      ],
      order: [["created_at", "DESC"]],
      where: {
        type: "funds",
      },
    });
    renderPage(req, res, "funds/index", {
      title: "funds Markets",
      activePage: "funds",
      getData,
    });
  } catch (error) {
    console.error("Error fetching funds market data:", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = { index };
