const express = require("express");
const mongoose = require("mongoose")
const app = express();
const cors = require("cors")
require("dotenv").config();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const AuthRouter = require("./routes/auth");
const ContactRouter = require("./routes/contact");

const corsOptions = {
  origin: [
    'https://full-js.flo-isk.fr',
    'http://localhost:8080'
  ],
};

app.use(express.json())
app.use(cors(corsOptions));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/auth", AuthRouter);
app.use("/contact", ContactRouter); 

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