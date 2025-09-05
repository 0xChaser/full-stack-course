const express = require("express");
const mongoose = require("mongoose")
const app = express();
const cors = require("cors")
const { router, requireAuth } = require("./routes/auth");
require("dotenv").config();

app.use(express.json())
app.use(cors());

app.use(router)

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(8080, () => {
        console.log("Back start on 8080")
    })
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.get("/", (req, res) => {
    res.send("Hey Chaser")
})
