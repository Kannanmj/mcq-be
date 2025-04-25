const express = require("express");
const cors = require("cors");
const connectDb = require("./config/connectDb");
const router = require("./router/studentdetails");
const question = require("./router/questions");
const visitor = require("./router/visitors");
const cookieParser = require("cookie-parser");

require("dotenv").config();
 
//create a app variable
const app = express();
app.use(cookieParser());

//middleware
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json("Api Running successfully"); 
})
 
const allowedOrigins = [
  "https://www.dialkaraikudi.com",
  "https://taupe-lily-9df3f5.netlify.app",
  "http://122.174.223.236:5173",
  "https://dialkaraikudi.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// app.use(
//   cors({
//     origin: "*",
//   })
// );
//connect database
connectDb(); 

//routes

//for the student registration
app.use("/students", router);
//for the question and answer added ti the database
app.use("/questions", question);

app.use("/visitors", visitor);

//listen the port
app.listen(process.env.PORT, () => {
  console.log(`Server is successfully running on the port ${process.env.PORT}`);
});
