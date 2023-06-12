const mongoose = require("mongoose");

require("dotenv").config();

mongoose.set("strictQuery", true);

async function main(){
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Successfully connected to DB")
};

main().catch((err) => console.log(err));

module.exports = main;