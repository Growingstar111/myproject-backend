const cron = require("node-cron");
const { discountCoupen } = require("./models/discount");

async function schduleTask(expireAt, coupenCode) {
  const expireCoupen = cron.schedule(`0 0 * * *`, async() => {
    if (Date.now() >= expireAt) {
      const deleteCoupen =  await discountCoupen.deleteOne({ coupenCode:coupenCode });
      console.log(deleteCoupen);
      
    } 
  });
  expireCoupen.start();
  return expireCoupen;
}

module.exports = { schduleTask };

