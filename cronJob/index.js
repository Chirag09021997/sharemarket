const cron = require("node-cron");
const { market: MarketModel } = require("../models/index");
const { commonService } = require("../services/index");
const axios = require("axios");
const settingJson = require("../json/setting.json");
const fs = require("fs");

const BATCH_SIZE = 19;
const updateCronLastFlag = (newFlagValue) => {
  settingJson.cron_last = newFlagValue;
  fs.writeFileSync(
    "./json/setting.json",
    JSON.stringify(settingJson, null, 2),
    "utf8"
  );
};

// cron.schedule("*/30 * * * * *", async () => {
//   console.log(`cron job testing... Time ::  ${Date()}`);
//   try {
//     let cronLast = settingJson?.cron_last || 0;
//     const offset = cronLast * BATCH_SIZE;
//     const market = await MarketModel.findAll({
//       attributes: ["symbol"],
//       offset: offset,
//       limit: BATCH_SIZE,
//     });
//     const marketList = market.map((item) => item.symbol);
//     if (marketList.length > 0) {
//       const symbolsString = marketList.join(",");
//       const baseURL = "https://query1.finance.yahoo.com/v7/finance/spark";
//       const params = {
//         symbols: symbolsString,
//         range: "1d",
//         interval: "5m",
//         indicators: "close",
//         includeTimestamps: "false",
//         includePrePost: "false",
//         corsDomain: "finance.yahoo.com",
//         ".tsrc": "finance",
//       };

//       try {
//         const response = await axios.get(baseURL, { params });
//         const results = response.data.spark.result;
//         for (const item of results) {
//           const symbol = item.symbol;
//           await commonService.update(
//             MarketModel,
//             { where: { symbol } },
//             { response: item.response[0] }
//           );
//         }
//         updateCronLastFlag(++cronLast);
//       } catch (error) {
//         console.error("axios Error:", error);
//       }
//     } else {
//       updateCronLastFlag(0);
//     }
//   } catch (error) {
//     console.error("CronJob Issue =>", error);
//   }
// });

// 10-minute cron job
cron.schedule("*/10 * * * *", async () => {
  console.log(`cron job 10 minutes ... Time ::  ${Date()}`);
  try {
    const baseURL = "https://query1.finance.yahoo.com/v1/finance/sectors";
    const params = {
      formatted: true,
      withReturns: true,
      lang: "en-US",
      region: "US",
      crumb: settingJson.crumb || "xOLOWkFexmI",
      corsDomain: "finance.yahoo.com",
    };
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie:
        settingJson.cookie ||
        "GUCS=AVRoquin; GUC=AQEBCAFnMNhnX0IgxQSj&s=AQAAALhN-7f6&g=Zy-KmQ; A1=d=AQABBAf9-2YCECTqrvvw_2ERTo0WCOOE-gYFEgEBCAHYMGdfZ1lQb2UB_eMBAAcIB_37ZuOE-gY&S=AQAAAmvcV0ux028jm8yzvBz0hVQ; A3=d=AQABBAf9-2YCECTqrvvw_2ERTo0WCOOE-gYFEgEBCAHYMGdfZ1lQb2UB_eMBAAcIB_37ZuOE-gY&S=AQAAAmvcV0ux028jm8yzvBz0hVQ; A1S=d=AQABBAf9-2YCECTqrvvw_2ERTo0WCOOE-gYFEgEBCAHYMGdfZ1lQb2UB_eMBAAcIB_37ZuOE-gY&S=AQAAAmvcV0ux028jm8yzvBz0hVQ; cmp=t=1731168915&j=0&u=1---; gpp=DBAA; gpp_sid=-1; axids=gam=y-xn0Xe1pE2uIrf9RoNbKHFmGFpCWDvSzo~A&dv360=eS1CbGR3REQxRTJ1Rkk2VXhaWVBCZHRGQ2FPS05mN2RsUH5B&ydsp=y-jH1wOW1E2uLe.nWa1xuIiMKZ1c8PiaRw~A&tbla=y-Oyz6qxZE2uIBFokKnM5UB.9cp0HAwN3Z~A; tbla_id=dffd4c37-bae4-49e1-8527-783a72a34e69-tuctdf2e663",
    };

    try {
      const response = await axios.get(baseURL, { params, headers });
      const results = response.data.sectors;
      fs.writeFile(
        "./json/sector.json",
        JSON.stringify(results, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error("Error writing to sector.json:", err);
          }
        }
      );
    } catch (error) {
      console.error("sector axios Error:", error);
    }
  } catch (error) {
    console.error("CronJob Issue sector 10 minutes cron =>", error);
  }
});
