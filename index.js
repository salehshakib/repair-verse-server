const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());

//mongo db connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@mycluster0.23iyqhu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

//jwt token handler

function verifyJWT(req, res, next) {
    const auhtHeader = req.headers.authorization; //auhtorization
    if (!auhtHeader) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    const token = auhtHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: "Forbidden access" });
      }
      req.decoded = decoded;
      next();
    });
  }


async function run() {
    try {
        const database = client.db("repairverse");
        const serviceCollection = database.collection("services");

        //get all services
        app.get("/services", async (req, res) => {
            const query = {}; //to find everything
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
    }
    finally {

    }
}


run().catch((err) => console.error(err));

app.get("/", (req, res) => {
    res.send("genius car server running");
});

app.listen(port, () => {
    console.log(`genius car server running on port ${port}`);
});