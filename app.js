const express = require("express");
const compression = require("compression");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const session = require("express-session");
const cookieParser = require("cookie-parser");


// const logger = require("./config/logger");
const { connectToMongoDB } = require("./utils/db");
const authMiddleware = require("./middlewares/auth-middleware");

const app = express();
dotenv.config();

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [
        "http://localhost:4300",
      ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
  exposedHeaders: ["Content-Range", "X-Content-Range"],
};

app.use(cors(corsOptions));
app.use(compression());

app.use(helmet());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.text());


app.use(cookieParser("5TOCyfH3HuszKGzFZntk"));
// app.use(morgan("tiny", { stream: logger.stream }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    status: false,
    message: err.message || "Internal Server Error",
  });
});

app.use(authMiddleware);
require("./routes/api")(app);

const PORT = process.env.PORT || 6000;

connectToMongoDB().then((connected) => {
  if (connected) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
});