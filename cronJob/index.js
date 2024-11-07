const cron = require("node-cron");
const { market: MarketModel } = require("../models/index");
const { commonService } = require("../services/index");
const axios = require("axios");
cron.schedule("*/3 * * * *", async () => {
  console.log(`cron job testing... Time ::  ${Date()}`);
  try {
    const market = await MarketModel.findAll({
      attributes: ["symbol"],
    });
    const marketList = market.map((item) => item.symbol);
    if (marketList.length > 0) {
      const chunkArray = (arr, size) => {
        const chunked = [];
        for (let i = 0; i < arr.length; i += size) {
          chunked.push(arr.slice(i, i + size));
        }
        return chunked;
      };

      const chunkedMarkets = chunkArray(marketList, 20);
      for (const marketChunk of chunkedMarkets) {
        const symbolsString = marketChunk.join(",");
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

        try {
          const response = await axios.get(baseURL, { params });
          const results = response.data.spark.result;
          for (const item of results) {
            const symbol = item.symbol;
            await commonService.update(
              MarketModel,
              { where: { symbol } },
              { response: item.response[0] }
            );
          }
        } catch (error) {
          console.error("axios Error:", error);
        }
      }
    }
  } catch (error) {
    console.error("CronJob Issue =>", error);
  }
});
