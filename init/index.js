const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderLust";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");

  await initDB();

  mongoose.connection.close();
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj)=>({...obj, owner: "6ad9e660888bd26581d8371d"}));
  await Listing.insertMany(initData.data);
  console.log("Data was initialized");
};

main().catch((err) => console.log(err));