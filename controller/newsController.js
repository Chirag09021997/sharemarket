const { commonService } = require("../services/index");
const { renderPage, cmDeleteRecord } = require("./commonController");
const { category: CategoryModel } = require("../models");
const { news: NewsModel } = require("../models");
const fs = require("fs");
const { Sequelize } = require("sequelize");
const { BASE_URL } = process.env;

const handleImageDeletion = async (image) => {
  image &&
    fs.unlink(`./public/images/${image}`, (err) => {
      if (err) console.error(`Error deleting file: ${err.message}`);
    });
};

const index = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const offset = (page - 1) * limit;
  try {
    const count = await NewsModel.count();
    const getData = await commonService.getAll(NewsModel, {
      order: [["created_at", "DESC"]],
      limit: limit,
      offset: offset,
      attributes: [
        "id",
        "category_id",
        "title",
        "url",
        [
          Sequelize.literal(`CONCAT('${BASE_URL}', '/images/', image)`),
          "image",
        ],
        "created_at",
      ],
    });
    const totalPages = Math.ceil(count / limit);
    renderPage(req, res, "news/index", {
      title: "News",
      activePage: "news",
      getData,
      limit,
      currentPage: page,
      totalPages: totalPages,
      totalRecords: count,
    });
  } catch (error) {
    console.error("Error fetching news data:", error);
    res.status(500).send("Internal Server Error");
  }
};

const create = async (req, res) => {
  try {
    const categories = await CategoryModel.findAll({
      where: {
        status: "active",
      },
    });
    res.render("news/create", {
      getData: categories,
      title: "News Create",
      activePage: "news",
      errorMsg: "",
      formData: {},
      errors: "",
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).send("Internal Server Error");
  }
};

const store = async (req, res) => {
  const { title, desc, url, category_id } = req.body;
  const image = req?.file?.filename;
  try {
    const newsData = { title, url, desc, image, category_id };
    await NewsModel.create(newsData);
    res.redirect("/news");
  } catch (error) {
    await handleImageDeletion(image);
    console.error("Error fetching news create:", error);
    res.status(500).send("Internal Server Error");
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const news = await NewsModel.findOne({
      where: { id },
      attributes: [
        "id",
        "category_id",
        "title",
        "url",
        [
          Sequelize.literal(`CONCAT('${BASE_URL}', '/images/', image)`),
          "image",
        ],
        "created_at",
        "desc",
      ],
      include: [
        {
          model: CategoryModel,
          as: "categories",
          attributes: ["name"],
        },
      ],
    });
    if (!news) {
      return res.status(404).send("News not found");
    }
    res.render("news/show", {
      title: "Show News",
      formData: news,
      activePage: "news",
    });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).send("Internal Server Error");
  }
};

const edit = async (req, res) => {
  const { id } = req.params;
  try {
    const categories = await CategoryModel.findAll({
      where: {
        status: "active",
      },
    });
    const news = await NewsModel.findOne({
      where: { id },
      attributes: [
        "id",
        "category_id",
        "title",
        "url",
        [
          Sequelize.literal(`CONCAT('${BASE_URL}', '/images/', image)`),
          "image",
        ],
        "created_at",
        "desc",
      ],
    });
    if (!news) {
      return res.status(404).send("News not found");
    }
    res.render("news/edit", {
      title: "Edit News",
      activePage: "news",
      errorMsg: "",
      formData: news,
      errors: {},
      categories,
    });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).send("Internal Server Error");
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { title, desc, url, category_id } = req.body;
  const image = req?.file?.filename;

  try {
    const existingNews = await NewsModel.findByPk(id);
    if (!existingNews) {
      return res.status(404).send("News not found");
    }

    if (image) {
      const existing = existingNews.dataValues.image;
      await handleImageDeletion(existing);
    }

    const newsData = { title, url, desc, image, category_id };
    await NewsModel.update(newsData, { where: { id } });
    res.redirect(`/news`);
  } catch (error) {
    await handleImageDeletion(image);
    console.error("Error updating news:", error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const news = await NewsModel.findByPk(id);
    if (!news) {
      return res.status(404).send("News not found");
    }
    await NewsModel.destroy({ where: { id } });
    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).send("Internal Server Error");
  }
};

const changeStatus = async (req, res) => {
  const { id } = req.params;
  if (id) {
    const news = await NewsModel.findByPk(id);
    let status = news.status == "active" ? "inactive" : "active";
    try {
      const newsDetail = await NewsModel.update({ status }, { where: { id } });
      if (newsDetail) {
        res.send({ success: true });
      } else {
        res.status(500).render("error", { error: "Internal Server Error" });
      }
    } catch (error) {
      res.status(500).render("error", { error: "Internal Server Error" });
    }
  } else {
    res.status(500).render("error", { error: "Internal Server Error" });
  }
};

module.exports = {
  index,
  create,
  store,
  show,
  edit,
  update,
  deleteRecord,
  changeStatus,
};
