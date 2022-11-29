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

    //services api
    //create
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    //get all services
    app.get("/services", async (req, res) => {
      const query = {}; //to find everything
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    //get a specific service by id
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    //review
    //create
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const d = new Date();
      review.date = d;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    //get all reviews
    app.get("/reviews", async (req, res) => {
      let query = {};
      console.log("This is from service review", req.query.serviceNo);
      //get review of a specific id
      if (req.query.serviceNo) {
        query = {
          serviceNo: req.query.serviceNo,
        };
      }
      //get all reviews by userid
      if (req.query.userId) {
        query = {
          userId: req.query.userId,
        };
      }
      const sort = { date: -1 };
      const cursor = reviewCollection.find(query).sort(sort);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });


    app.get("/reviewUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const myReview = await reviewCollection.findOne(query);
      res.send(myReview);
    });
    //review update
    app.patch("/reviewUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const updatedReview = req.body.userReview;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          userReview: updatedReview,
        },
      };
      const result = await reviewCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    //review delete
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

  }
  finally {

  }
}


run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("repair verse server running");
});

app.listen(port, () => {
  console.log(`repair verse server running on port ${port}`);
});