const express = require("express");
const app = express();
const cors = require("cors")

app.listen(8080, () => {
    console.log("Back start on 8080")
})
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hey Chaser")
})