const { market: MarketModel } = require("../models/index");
const fs = require("fs");
const { symbol } = require("joi");
const path = require("path");

const getAll = async (req, res) => {
  try {
    const market = await MarketModel.findAll({
      attributes: ["id", "symbol", "image", "image_url", "response", "country", "industry"],
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
      attributes: ["id", "symbol", "image", "image_url", "response", "country", "industry"],
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
      records.forEach(async(record) => {
       await allRecords.push({symbol:record.Symbol, industry:record.Industry, country:record.country, created_at:Date.now(), updated_at:Date.now()});
      });
    }
    
    const result = await MarketModel.bulkCreate(allRecords, { validate: true , ignoreDuplicates: true, });
    fs.unlinkSync(filePath);
    res.status(201).json({ status: true, data: result });
  } catch (error) {
    console.error("Error in multipleCreate:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAll,
  getSingle,
  multipleCreate,
};
