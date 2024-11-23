const { commonService } = require("../services/index");
const { renderPage, cmDeleteRecord } = require("./commonController");
const { category: CategoryModel } = require("../models");
const { categoryValidate } = require("../validate/index");

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
    activePage: "category",
    errorMsg: "Validation Error.",
    formData,
    errors,
  });
};

const saveCategory = async (method, req, res, id = null) => {
  const { name } = req.body;

  const { error } = categoryValidate.validate(req.body, { abortEarly: false });
  if (error) {
    return handleValidationError(
      error,
      res,
      `category/${method}`,
      `${method === "create" ? "Create" : "Edit"} Category`,
      req,
      req.body
    );
  }

  try {
    const existing = await commonService.get(CategoryModel, {
      where: { id },
    });

    if (existing && method === "create") {
      return renderPage(req, res, `category/${method}`, {
        title: `${method === "create" ? "Create" : "Edit"} Category`,
        activePage: "category",
        errorMsg: "category already exists",
        formData: req.body,
      });
    }

    const data = { name };
    if (method === "create") {
      await commonService.create(CategoryModel, data);
    } else {
      await commonService.update(CategoryModel, { where: { id } }, data);
    }
    res.redirect("/category");
  } catch (err) {
    console.error(`Category ${method} Error =>`, err);
    renderPage(req, res, `category/${method}`, {
      title: "Category",
      activePage: "category",
      errorMsg: err,
      formData: req.body,
    });
  }
};

// Controller Methods
const index = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const offset = (page - 1) * limit;
  try {
    const count = await CategoryModel.count();
    const getData = await commonService.getAll(CategoryModel, {
      attributes: ["id", "name", "status"],
      order: [["created_at", "DESC"]],
      limit: limit,
      offset: offset,
    });
    const totalPages = Math.ceil(count / limit);
    renderPage(req, res, "category/index", {
      title: "Categories",
      activePage: "category",
      getData,
      limit,
      currentPage: page,
      totalPages: totalPages,
      totalRecords: count,
    });
  } catch (error) {
    console.error("Error fetching category data:", error);
    res.status(500).send("Internal Server Error");
  }
};

const renderFormPage = (req, res, view, pageTitle, id = null) =>
  commonService
    .get(CategoryModel, { where: { id } })
    .then((detail) => {
      if (id && !detail) return res.redirect("/category");
      renderPage(req, res, view, {
        title: pageTitle,
        activePage: "category",
        formData: detail || {},
      });
    })
    .catch(() => res.redirect("/category"));

module.exports = {
  index,
  create: (req, res) =>
    renderFormPage(req, res, "category/create", "Create Category"),
  show: (req, res) =>
    renderFormPage(
      req,
      res,
      "category/show",
      "Category Details",
      req.params.id
    ),
  edit: (req, res) =>
    renderFormPage(req, res, "category/edit", "Edit Category", req.params.id),
  store: (req, res) => saveCategory("create", req, res),
  update: (req, res) => saveCategory("edit", req, res, req.params.id),
  deleteRecord: (req, res) => cmDeleteRecord(req, res, CategoryModel),
};
