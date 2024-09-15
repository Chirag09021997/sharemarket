const { renderPage } = require("../controller/commonController");
const dashboard = async (req, res) => {
  renderPage(req, res, "dashboard", {
    title: "Dashboard",
    activePage: "dashboard",
  });
};
module.exports = { dashboard };
