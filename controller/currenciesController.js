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
        type: "currencies",
      },
    });
    renderPage(req, res, "currencies/index", {
      title: "currencies Markets",
      activePage: "currencies",
      getData,
    });
  } catch (error) {
    console.error("Error fetching currencies market data:", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = { index };
