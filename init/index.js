if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const { data } = require("./data.js");

async function main() {
  const mongoUrl = process.env.MONGO_URL?.trim();
  if (!mongoUrl) throw new Error("Set MONGO_URL before adding the sample listings.");

  await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 15000 });
  let inserted = 0;
  let alreadyPresent = 0;

  for (const listing of data) {
    const result = await Listing.updateOne(
      { title: listing.title },
      { $setOnInsert: listing },
      { upsert: true, runValidators: true }
    );
    if (result.upsertedCount) inserted += 1;
    else alreadyPresent += 1;
  }

  console.log(`Added ${inserted} sample listings; ${alreadyPresent} were already present.`);
}

main()
  .catch((err) => {
    console.error("Could not add sample listings:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
