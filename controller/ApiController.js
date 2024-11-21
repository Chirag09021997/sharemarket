const { market: MarketModel } = require("../models/index");
const fs = require("fs");
const { symbol } = require("joi");
const path = require("path");
const { Op, Sequelize } = require("sequelize");
const sectorJson = require("../json/sector.json");
const settingJson = require("../json/setting.json");
const { commonService } = require("../services/index");

const getAll = async (req, res) => {
  try {
    const markets = await MarketModel.findAll({
      attributes: [
        "id",
        "symbol",
        "image",
        "image_url",
        "response",
        "country",
        "industry",
        "type",
        "subtype",
      ],
    });
    const modifiedMarkets = markets.map((market) => {
      const { image, image_url } = market.dataValues;
      const finalImage = image && image.length > 0 ? image : image_url;
      delete market.dataValues.image_url;
      return {
        ...market.dataValues,
        image: finalImage,
      };
    });
    res.json({
      status: true,
      message: "Get all market record successFully.",
      data: modifiedMarkets,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const getSingle = async (req, res) => {
  const id = req.params.id;
  try {
    const market = await MarketModel.findOne({
      attributes: [
        "id",
        "symbol",
        "image",
        "image_url",
        "response",
        "country",
        "industry",
        "type",
        "subtype",
      ],
      where: { id },
    });
    if (!market) {
      return res.status(404).json({
        status: false,
        message: "Market not found.",
      });
    }
    const { image, image_url } = market.dataValues;
    let finalImage = image && image.length > 0 ? image : image_url;
    delete market.dataValues.image_url;
    res.json({
      status: true,
      message: "Get single market record successFully.",
      data: {
        ...market.dataValues,
        image: finalImage,
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const multipleCreate = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const filePath = path.join(__dirname, "../public/images", file.filename);
    const fileData = fs.readFileSync(filePath, "utf8");
    let parsedData;
    try {
      parsedData = JSON.parse(fileData);
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON format" });
    }
    const allRecords = [];
    for (const [country, records] of Object.entries(parsedData)) {
      records.forEach(async (record) => {
        await allRecords.push({
          symbol: record.Symbol,
          industry: record.Industry,
          country: record.country,
          created_at: Date.now(),
          updated_at: Date.now(),
          type: record.type,
          subtype: record.subtype,
        });
      });
    }

    const result = await MarketModel.bulkCreate(allRecords, {
      validate: true,
      ignoreDuplicates: true,
    });
    fs.unlinkSync(filePath);
    res.status(201).json({ status: true, data: result });
  } catch (error) {
    console.error("Error in multipleCreate:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getStocks = async (req, res) => {
  try {
    const { country = "", industry = "", type = "" } = req.body;
    const { page = 0, limit = 0 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    if (type.length == 0) {
      return res.status(400).json({ status: false, message: "type required" });
    }
    const conditionData = {
      attributes: [
        "id",
        "symbol",
        "image",
        "image_url",
        "response",
        "country",
        "industry",
        "type",
        "subtype",
      ],
      where: {
        type,
      },
    };
    if (country.length > 0) {
      conditionData.where.country = country;
    }
    if (industry.length > 0) {
      conditionData.where.industry = industry;
    }
    if (pageNumber > 0) {
      conditionData.offset = (pageNumber - 1) * limitNumber;
    }
    if (limitNumber > 0) {
      conditionData.limit = limitNumber;
    }
    const market = await MarketModel.findAll(conditionData);
    const modifiedMarkets = market.map((market) => {
      const { image, image_url } = market.dataValues;
      const finalImage = image && image.length > 0 ? image : image_url;
      delete market.dataValues.image_url;
      return {
        ...market.dataValues,
        image: finalImage,
      };
    });
    const totalCount = await MarketModel.count({
      where: {
        type,
        ...(country.length > 0 && { country }),
        ...(industry.length > 0 && { industry }),
      },
    });
    res.json({
      status: true,
      message: `Get all type stocks record successfully.`,
      data: modifiedMarkets,
      pagination: {
        currentPage: pageNumber,
        totalPages: limitNumber > 0 ? Math.ceil(totalCount / limitNumber) : 0,
        totalCount,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error(`Error fetching stock data:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getStockSubtypes = async (req, res) => {
  const { type, subtypes } = req.body;
  const subtypeArray =
    typeof subtypes === "string" ? subtypes.split(",") : subtypes;
  if (!type || subtypeArray.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid 'type' or 'subtypes' input." });
  }
  try {
    const market = await MarketModel.findAll({
      attributes: [
        "id",
        "symbol",
        "image",
        "image_url",
        "response",
        "country",
        "industry",
        "type",
        "subtype",
      ],
      where: {
        type,
        subtype: { [Op.in]: subtypeArray },
      },
    });

    const modifiedMarkets = market.map((market) => {
      const { image, image_url } = market.dataValues;
      const finalImage = image && image.length > 0 ? image : image_url;
      delete market.dataValues.image_url;
      return {
        ...market.dataValues,
        image: finalImage,
      };
    });
    const organizedData = modifiedMarkets.reduce((acc, item) => {
      const key = item.subtype;
      if (acc[key]) acc[key].push(item);
      return acc;
    }, Object.fromEntries(subtypeArray.map((subtype) => [subtype, []])));

    res.json({
      status: true,
      message: `Get all type ${type} record successfully.`,
      data: organizedData,
    });
  } catch (error) {
    console.error(`Error fetching ${type} data:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const overViewList = async (req, res) => {
  const BATCH_SIZE = 19;
  try {
    const possibleSubtypes = [
      "asia_pacific",
      "americas",
      "europe_middleeast_africa",
    ];
    let apiLast = settingJson?.api_last || 0;
    const offset = apiLast * BATCH_SIZE;
    const market = await MarketModel.findAll({
      attributes: ["symbol"],
      offset: offset,
      limit: BATCH_SIZE,
    });
    const marketSymbols = market.map((item) => item.symbol);
    let stringSymbols = "";
    if (marketSymbols.length > 0) {
      stringSymbols = marketSymbols.join(",");
      updateAPILastFlag(++apiLast);
    } else {
      updateAPILastFlag(0);
    }

    const marketList = await MarketModel.findAll({
      attributes: [
        "id",
        "symbol",
        "image",
        "image_url",
        "response",
        "country",
        "industry",
        "type",
        "subtype",
      ],
      where: {
        type: "indics",
        overview: "active",
        subtype: { [Op.in]: possibleSubtypes },
      },
    });
    const modifiedMarkets = marketList.map((market) => {
      const { image, image_url } = market.dataValues;
      const finalImage = image && image.length > 0 ? image : image_url;
      delete market.dataValues.image_url;
      return {
        ...market.dataValues,
        image: finalImage,
      };
    });
    const organizedData = modifiedMarkets.reduce((acc, item) => {
      const key = item.subtype;
      if (acc[key]) acc[key].push(item);
      return acc;
    }, Object.fromEntries(possibleSubtypes.map((subtype) => [subtype, []])));
    organizedData.sector = sectorJson;
    organizedData.symbols = stringSymbols;
    res.json({
      status: true,
      message: `Get all overview record successfully.`,
      data: organizedData,
    });
  } catch (error) {
    console.error(`Error fetching ${type} data:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateAPILastFlag = (newFlagValue) => {
  settingJson.api_last = newFlagValue;
  fs.writeFileSync(
    "./json/setting.json",
    JSON.stringify(settingJson, null, 2),
    "utf8"
  );
};

const updateMarketData = async (req, res) => {
  const { response } = req.body;
  const BATCH_SIZE = 19;
  try {
    if (Array.isArray(response) && response?.length > 0) {
      for (const item of response) {
        const symbol = item.symbol;
        await commonService.update(
          MarketModel,
          { where: { symbol } },
          { response: item.response[0] }
        );
      }
      let apiLast = settingJson?.api_last || 0;
      const offset = apiLast * BATCH_SIZE;
      const market = await MarketModel.findAll({
        attributes: ["symbol"],
        offset: offset,
        limit: BATCH_SIZE,
      });
      const marketSymbols = market.map((item) => item.symbol);
      let stringSymbols = "";
      if (marketSymbols.length > 0) {
        stringSymbols = marketSymbols.join(",");
        updateAPILastFlag(++apiLast);
      } else {
        updateAPILastFlag(0);
      }
      res.json({
        status: true,
        message: `Market record update successfully.`,
        data: { symbols: stringSymbols },
      });
    } else {
      res
        .status(400)
        .json({ status: false, error: "Market record not found." });
    }
  } catch (error) {
    console.error(`Error fetching update market data:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const searchMarket = async (req, res) => {
  const { search = "", page = 1, limit = 25 } = req.query;
  try {
    const pageNumber = Math.max(parseInt(page, 10), 1);
    const limitNumber = Math.max(parseInt(limit, 10), 25);
    const whereCondition = {
      [Op.and]: [
        Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("symbol")),
          "LIKE",
          `%${search.toLowerCase()}%`
        ),
        Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("industry")),
          "LIKE",
          `%${search.toLowerCase()}%`
        ),
      ],
    };

    const [market, totalCount] = await Promise.all([
      MarketModel.findAll({
        where: whereCondition,
        attributes: [
          "id",
          "symbol",
          "image",
          "image_url",
          "response",
          "country",
          "industry",
          "type",
          "subtype",
        ],
        offset: (pageNumber - 1) * limitNumber,
        limit: limitNumber,
      }),
      MarketModel.count({ where: whereCondition }),
    ]);

    const modifiedMarkets = market.map((market) => {
      const { image, image_url } = market.dataValues;
      const finalImage = image && image.length > 0 ? image : image_url;
      delete market.dataValues.image_url;
      return {
        ...market.dataValues,
        image: finalImage,
      };
    });
    res.json({
      status: true,
      message: "Search market results fetched successfully.",
      data: modifiedMarkets,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
        totalCount,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Error in searchData:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAll,
  getSingle,
  multipleCreate,
  getStocks,
  getStockSubtypes,
  overViewList,
  updateMarketData,
  searchMarket,
};
