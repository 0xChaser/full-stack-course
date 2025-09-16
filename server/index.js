const express = require("express");
const mongoose = require("mongoose")
const app = express();
const cors = require("cors")
require("dotenv").config();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const AuthRouter = require("./routes/auth");
const ContactRouter = require("./routes/contact");

app.use(express.json())
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/auth", AuthRouter);
app.use("/contact", ContactRouter); 

mongoose.connect("mongodb://localhost:27017/mycontacts")
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