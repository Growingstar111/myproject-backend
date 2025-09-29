const mongoose = require("mongoose");
mongoose.set("debug", true);
async function connectMongoDb(url) {
    return mongoose.connect(url)
    

}
module.exports = {connectMongoDb}