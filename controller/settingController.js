const fs = require("fs");
const path = require("path");
const { renderPage } = require("./commonController");

const settingsPath = path.join(__dirname, "../json/setting.json");

// Controller Methods
const index = async (req, res) => {
  try {
    // Read settings from setting.json
    fs.readFile(settingsPath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading setting.json:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Parse and retrieve formData values
      let formData = {};
      try {
        formData = JSON.parse(data);
      } catch (parseError) {
        console.error("Error parsing setting.json:", parseError);
        return res.status(500).send("Internal Server Error");
      }

      // Render page with current crumb and cookie values
      renderPage(req, res, "setting", {
        title: "Setting",
        activePage: "setting",
        formData,
      });
    });
  } catch (error) {
    console.error("Error fetching setting data:", error);
    res.status(500).send("Internal Server Error");
  }
};

const update = async (req, res) => {
  const { crumb, cookie } = req.body;
  try {
    // Read the current settings
    fs.readFile(settingsPath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading setting.json:", err);
        return res.status(500).send("Internal Server Error");
      }

      let settings;
      try {
        settings = JSON.parse(data);
      } catch (parseError) {
        console.error("Error parsing setting.json:", parseError);
        return res.status(500).send("Internal Server Error");
      }

      // Update the values
      settings.crumb = crumb;
      settings.cookie = cookie;

      // console.log("Updated settings data:", settings);

      // Write the updated settings back to the file
      fs.writeFile(
        settingsPath,
        JSON.stringify(settings, null, 2),
        "utf8",
        (writeErr) => {
          if (writeErr) {
            console.error("Error writing to setting.json:", writeErr);
            return res.status(500).send("Internal Server Error");
          } else {
            console.log("Updated setting.json successfully.");
            res.redirect("/setting"); // Redirect to confirm update
          }
        }
      );
    });
  } catch (error) {
    console.error("Error updating setting data:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { index, update };
