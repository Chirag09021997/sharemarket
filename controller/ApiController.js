const { market: MarketModel } = require("../models/index");

const getAll = async (req, res) => {
  try {
    const market = await MarketModel.findAll({
      attributes: ["id", "symbol", "image", "image_url", "response"],
    });
    res.json({
      status: true,
      message: "Get all market record successFully.",
      data: market,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const getSingle = async (req, res) => {
  const id = req.params.id;
  try {
    const market = await MarketModel.findOne({
      attributes: ["id", "symbol", "image", "image_url", "response"],
      where: { id },
    });
    res.json({
      status: true,
      message: "Get single market record successFully.",
      data: market,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = {
  getAll,
  getSingle,
};
