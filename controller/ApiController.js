const {
  market: MarketModel,
  news: NewsModel,
  category: CategoryModel,
  tracking: UserTrackingModel,
} = require("../models/index");
const fs = require("fs");
const { symbol } = require("joi");
const path = require("path");
const { Op, Sequelize } = require("sequelize");
const sectorJson = require("../json/sector.json");
const settingJson = require("../json/setting.json");
const { commonService } = require("../services/index");
const { userTrackingValidate } = require("../validate");
const { BASE_URL } = process.env;

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
        "name",
        "regular_market_price",
        "previous_close",
        "market_type",
        "regular_market_day_high",
        "regular_market_day_low",
      ],
    });
    const modifiedMarkets = markets.map((market) => {
      const { image, image_url, response } = market.dataValues;
      const finalImage = image && image.length > 0 ? image : image_url;
      delete market.dataValues.image_url;
      let responseData = response;
      if (typeof responseData === "string") {
        try {
          responseData = JSON.parse(responseData);
        } catch (err) {
          console.error(`Error parsing response for symbol ${symbol}:`, err);
        }
      }
      return {
        ...market.dataValues,
        image: finalImage,
        response: responseData,
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
        "name",
        "regular_market_price",
        "previous_close",
        "market_type",
        "regular_market_day_high",
        "regular_market_day_low",
      ],
      where: { id },
    });
    if (!market) {
      return res.status(404).json({
        status: false,
        message: "Market not found.",
      });
    }
    const { image, image_url, response } = market.dataValues;
    let finalImage = image && image.length > 0 ? image : image_url;
    delete market.dataValues.image_url;
    let responseData = response;
    if (typeof responseData === "string") {
      try {
        responseData = JSON.parse(responseData);
      } catch (err) {
        console.error(`Error parsing response for symbol ${symbol}:`, err);
      }
    }
    res.json({
      status: true,
      message: "Get single market record successFully.",
      data: {
        ...market.dataValues,
        image: finalImage,
        response: responseData,
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
          name: record.name || null,
          regular_market_price: record.regular_market_price || 0,
          previous_close: record.previous_close || 0,
          market_type: record.market_type || "None",
          regular_market_day_high: record.regular_market_day_high || 0,
          regular_market_day_low: record.regular_market_day_low || 0,
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
        "name",
        "regular_market_price",
        "previous_close",
        "market_type",
        "regular_market_day_high",
        "regular_market_day_low",
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
        "name",
        "regular_market_price",
        "previous_close",
        "market_type",
        "regular_market_day_high",
        "regular_market_day_low",
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
  const { market_type = "None" } = req.body;
  const BATCH_SIZE = 19;
  try {
    const possibleSubtypes = [
      "asia_pacific",
      "americas",
      "europe_middleeast_africa",
      "australia",
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
        "name",
        "regular_market_price",
        "previous_close",
        "market_type",
        "regular_market_day_high",
        "regular_market_day_low",
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

    const topGainers = await MarketModel.findAll({
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
        "name",
        "regular_market_price",
        "previous_close",
        "market_type",
        "regular_market_day_high",
        "regular_market_day_low",
        [
          Sequelize.literal(
            "CAST(regular_market_price AS FLOAT) - CAST(previous_close AS FLOAT)"
          ),
          "price_difference",
        ],
      ],
      where: {
        type: "indics",
        overview: "active",
        subtype: { [Op.in]: possibleSubtypes },
        market_type: market_type,
      },
      order: [
        [
          Sequelize.literal(
            "CAST(regular_market_price AS FLOAT) - CAST(previous_close AS FLOAT)"
          ),
          "DESC",
        ],
      ],
      limit: 5,
    });

    const topLosers = await MarketModel.findAll({
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
        "name",
        "regular_market_price",
        "previous_close",
        "market_type",
        "regular_market_day_high",
        "regular_market_day_low",
        [
          Sequelize.literal(
            "CAST(regular_market_price AS FLOAT) - CAST(previous_close AS FLOAT)"
          ),
          "price_difference",
        ],
      ],
      where: {
        type: "indics",
        overview: "active",
        subtype: { [Op.in]: possibleSubtypes },
        market_type: market_type,
      },
      order: [
        [
          Sequelize.literal(
            "CAST(regular_market_price AS FLOAT) - CAST(previous_close AS FLOAT)"
          ),
          "ASC",
        ],
      ],
      limit: 5,
    });

    const topMovers = await MarketModel.findAll({
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
        "name",
        "regular_market_price",
        "previous_close",
        "market_type",
        "regular_market_day_high",
        "regular_market_day_low",
        [
          Sequelize.literal(
            "(regular_market_day_high - regular_market_day_low) / regular_market_day_low * 100"
          ),
          "move_per",
        ],
      ],
      where: {
        type: "indics",
        overview: "active",
        subtype: { [Op.in]: possibleSubtypes },
        market_type: market_type,
      },
      order: [
        [
          Sequelize.literal(
            "(regular_market_day_high - regular_market_day_low) / regular_market_day_low * 100"
          ),
          "DESC",
        ],
      ],
      limit: 5,
    });

    organizedData.topMovers = topMovers.map((item) => {
      const { image, image_url } = item.dataValues;
      const finalImage = image && image.length > 0 ? image : image_url;
      delete item.dataValues.image_url;
      return {
        ...item.dataValues,
        image: finalImage,
      };
    });

    organizedData.topGainers = topGainers.map((item) => {
      const { image, image_url } = item.dataValues;
      const finalImage = image && image.length > 0 ? image : image_url;
      delete item.dataValues.image_url;
      return {
        ...item.dataValues,
        image: finalImage,
      };
    });

    organizedData.topLosers = topLosers.map((item) => {
      const { image, image_url } = item.dataValues;
      const finalImage = image && image.length > 0 ? image : image_url;
      delete item.dataValues.image_url;
      return {
        ...item.dataValues,
        image: finalImage,
      };
    });
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
  const { response, unavailable_symbol } = req.body;
  const BATCH_SIZE = 19;

  try {
    if (Array.isArray(response) && response.length > 0) {
      for (const item of response) {
        const symbol = item.symbol;
        let responseData = item.response[0];
        if (typeof responseData === "string") {
          try {
            responseData = JSON.parse(responseData);
          } catch (err) {
            console.error(`Error parsing response for symbol ${symbol}:`, err);
            continue;
          }
        } else if (typeof responseData !== "object") {
          console.error(`Invalid response data format for symbol ${symbol}`);
          continue;
        }
        // if (typeof responseData === "object") {
        //   responseData = JSON.stringify(responseData);
        // }
        await MarketModel.update(
          {
            response: responseData,
            name: responseData?.meta?.longName || null,
            regular_market_price:
              parseFloat(responseData?.meta?.regularMarketPrice) || 0,
            previous_close: parseFloat(responseData?.meta?.previousClose) || 0,
            regular_market_day_high:
              parseFloat(responseData?.meta?.regularMarketDayHigh) || 0,
            regular_market_day_low:
              parseFloat(responseData?.meta?.regularMarketDayLow) || 0,
          },
          { where: { symbol } }
        );
      }

      if (unavailable_symbol) {
        const unavailableSymbols = unavailable_symbol.split(",");
        await MarketModel.update(
          { status: "inactive" },
          { where: { symbol: unavailableSymbols } }
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
        message: `Market record updated successfully.`,
        data: { symbols: stringSymbols },
      });
    } else {
      res
        .status(400)
        .json({ status: false, error: "Market record not found." });
    }
  } catch (error) {
    console.error("Error updating market data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const searchMarket = async (req, res) => {
  const { search = "", page = 1, limit = 25 } = req.query;
  console.log("search =>", search);
  try {
    const pageNumber = Math.max(parseInt(page, 10), 1);
    const limitNumber = Math.max(parseInt(limit, 10), 25);
    const whereCondition = {
      [Op.or]: [
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
        Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("name")),
          "LIKE",
          `%${search.toLowerCase()}%`
        ),
        Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("market_type")),
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
          "name",
          "regular_market_price",
          "previous_close",
          "market_type",
          "regular_market_day_high",
          "regular_market_day_low",
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

const newsAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const offset = (page - 1) * limit;
  try {
    const count = await NewsModel.count();
    const getData = await NewsModel.findAll({
      limit: limit,
      offset: offset,
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "category_id",
        "title",
        "url",
        "desc",
        "created_at",
        [
          Sequelize.literal(`CONCAT('${BASE_URL}', '/images/', image)`),
          "image",
        ],
      ],
      include: [
        {
          model: CategoryModel,
          as: "categories",
          attributes: ["name"],
        },
      ],
    });

    res.json({
      status: true,
      message: "Get news all record successfully.",
      data: getData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalCount: count,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching news data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const newsSingle = async (req, res) => {
  const { id } = req.params;
  try {
    const getData = await NewsModel.findOne({
      attributes: [
        "id",
        "category_id",
        "title",
        "url",
        "desc",
        "created_at",
        [
          Sequelize.literal(`CONCAT('${BASE_URL}', '/images/', image)`),
          "image",
        ],
      ],
      include: [
        {
          model: CategoryModel,
          as: "categories",
          attributes: ["name"],
        },
      ],
      where: { id },
    });
    if (!getData) {
      res.status(400).json({ error: "record not found." });
    }
    res.json({
      status: true,
      message: "Get news record successfully.",
      data: getData,
    });
  } catch (error) {
    console.error("Error fetching news data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const userTracking = async (req, res) => {
  const { error, value } = userTrackingValidate.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    res.status(400).json({ status: false, error: error.message });
  }
  try {
    const { device_id } = value;
    const existingRecord = await UserTrackingModel.findOne({
      where: { device_id },
      attributes: [
        "id",
        "device_id",
        "promotion_type",
        "country_name",
        "state_name",
        "city_name",
        "total_open",
        "status",
      ],
    });
    if (existingRecord) {
      existingRecord.total_open += 1;
      await existingRecord.save();
      res.json({
        status: true,
        message: "User tracking record updated successfully.",
        data: existingRecord,
      });
    } else {
      const data = await UserTrackingModel.create({
        ...value,
        total_open: 1,
      });
      res.json({
        status: true,
        message: "User tracking record created successfully.",
        data,
      });
    }
  } catch (error) {
    console.error("Error creating user tracking record:", error);
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
  newsAll,
  newsSingle,
  userTracking,
};
