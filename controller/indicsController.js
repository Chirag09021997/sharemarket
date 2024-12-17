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
        "name",
        "market_type",
        "regular_market_price",
        "previous_close",
        "status",
      ],
      order: [["created_at", "DESC"]],
      where: {
        type: "indics",
      },
    });
    renderPage(req, res, "indics/index", {
      title: "indics Markets",
      activePage: "indics",
      getData,
    });
  } catch (error) {
    console.error("Error fetching market data:", error);
    res.status(500).send("Internal Server Error");
  }
};

const changeOverview = async (req, res) => {
  const { id } = req.params;
  try {
    const getData = await commonService.get(MarketModel, {
      where: {
        type: "indics",
        id,
      },
    });
    if (!getData) {
      return res.status(404).send("Market not found");
    }
    const overview = getData.overview == "active" ? "inactive" : "active";
    const updatedData = await getData.update({
      overview: overview,
    });
    res.json(updatedData);
  } catch (error) {
    console.error("Error fetching market data:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { index, changeOverview };
