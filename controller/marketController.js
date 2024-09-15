const { Op } = require("sequelize"); // Add Op to use the 'not equal' operator for update
const { commonService } = require("../services/index");
const { renderPage, cmDeleteRecord } = require("./commonController");
const { market: MarketModel } = require("../models");
const { marketValidate } = require("../validate/index");
const fs = require("fs");

// Utility for validation and rendering errors
const handleValidationError = (error, res, view, pageTitle, req, formData) => {
  const errors = error.details.reduce(
    (acc, err) => ({
      ...acc,
      [err.context.key]: err.message,
    }),
    {}
  );
  renderPage(req, res, view, {
    title: pageTitle,
    activePage: "market",
    errorMsg: "Validation Error.",
    formData,
    errors,
  });
};

// Utility to delete an image file
const handleImageDeletion = (image) => {
  image &&
    fs.unlink(`./public/images/${image}`, (err) => {
      if (err) console.error(`Error deleting file: ${err.message}`);
    });
};

// Reusable function for creating or updating a market
const saveMarket = async (method, req, res, id = null) => {
  const { image_url, symbol, country, industry } = req.body;
  const image = req?.file?.filename;

  // Validate input data
  const { error } = marketValidate.validate(req.body, { abortEarly: false });
  if (error) {
    handleImageDeletion(image);
    return handleValidationError(
      error,
      res,
      `market/${method}`,
      `${method === "create" ? "Create" : "Edit"} Market`,
      req,
      req.body
    );
  }

  try {
    // Check if symbol already exists
    const symbolCondition = id
      ? { symbol, id: { [Op.ne]: id } } // For update, exclude the current record
      : { symbol }; // For create, just check the symbol

    const existingMarket = await commonService.get(MarketModel, {
      where: symbolCondition,
    });

    if (existingMarket) {
      return renderPage(req, res, `market/${method}`, {
        title: `${method === "create" ? "Create" : "Edit"} Market`,
        activePage: "market",
        errorMsg: "Symbol already exists. Please choose a different symbol.",
        formData: req.body,
      });
    }

    const data = {
      image_url,
      symbol,
      country,
      industry,
    };

    if (image) {
      data.image = `${process.env.BASE_URL}/images/${image}`;
    }

    // Perform create or update operation
    if (method === "create") {
      await commonService.create(MarketModel, data);
    } else {
      await commonService.update(MarketModel, { where: { id } }, data);
    }
    res.redirect("/market");
  } catch (err) {
    console.error(`Market ${method} Error =>`, err);
    renderPage(req, res, `market/${method}`, {
      title: "Markets",
      activePage: "market",
      errorMsg: err,
      formData: req.body,
    });
  }
};

// Controller Methods
const index = async (req, res) => {
  const getData = await commonService.getAll(MarketModel, {
    attributes: ["id", "symbol", "image", "image_url", "country", "industry"],
    order: [["created_at", "DESC"]],
  });
  renderPage(req, res, "market/index", {
    title: "Markets",
    activePage: "market",
    getData,
  });
};

const renderFormPage = (req, res, view, pageTitle, id = null) =>
  commonService
    .get(MarketModel, { where: { id } })
    .then((detail) => {
      if (id && !detail) return res.redirect("/market");
      renderPage(req, res, view, {
        title: pageTitle,
        activePage: "market",
        formData: detail || {},
      });
    })
    .catch(() => res.redirect("/market"));

module.exports = {
  index,
  create: (req, res) =>
    renderFormPage(req, res, "market/create", "Create Market"),
  show: (req, res) =>
    renderFormPage(req, res, "market/show", "Market Details", req.params.id),
  edit: (req, res) =>
    renderFormPage(req, res, "market/edit", "Edit Market", req.params.id),
  store: (req, res) => saveMarket("create", req, res),
  update: (req, res) => saveMarket("edit", req, res, req.params.id),
  deleteRecord: (req, res) => cmDeleteRecord(req, res, MarketModel),
};
