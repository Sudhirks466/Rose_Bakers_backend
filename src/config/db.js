const mongoose = require('mongoose');

const mongoDB_Url = process.env.CONNECTION_STRING;

if (!mongoDB_Url) {
    console.error("CONNECTION_STRING missing in .env");
    process.exit(1);
}

mongoose.set("strictQuery", false);
mongoose.set("runValidators", true);

mongoose.connect(mongoDB_Url, { retryWrites: false, })
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

mongoose.connection.on('error', (err) => {
    console.error("MongoDB runtime error:", err);
});
