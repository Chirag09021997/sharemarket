const cron = require("node-cron");
const { market: MarketModel } = require("../models/index");
const { commonService } = require("../services/index");
const axios = require("axios");
cron.schedule("*/15 * * * * *", async () => {
  console.log(`cron job testing... Time ::  ${Date()}`);
  try {
    const market = await MarketModel.findAll({
      attributes: ["symbol"],
    });
    const marketList = market.map((item) => item.symbol);
    if (marketList.length > 0) {
      const symbolsString = marketList.join(",");
      const baseURL = "https://query1.finance.yahoo.com/v7/finance/spark";
      const params = {
        symbols: symbolsString,
        range: "1d",
        interval: "5m",
        indicators: "close",
        includeTimestamps: "false",
        includePrePost: "false",
        corsDomain: "finance.yahoo.com",
        ".tsrc": "finance4",
      };
      await axios
        .get(baseURL, { params })
        .then((response) => {
          const results = response.data.spark.result;
          results.map(async (item) => {
            const symbol = item.symbol;
            await commonService.update(
              MarketModel,
              { where: { symbol } },
              { response: item.response[0] }
            );
          });
        })
        .catch((error) => {
          console.error("axios Error:", error);
        });
    }
  } catch (error) {
    console.error("CronJob Issue =>", error);
  }
});
