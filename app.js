const express = require("express");

const cors = require('cors');

const app = express();

const userRouter = require('./routes/userRoute');

const letterRouter = require('./routes/letterRoute');

const errorHandleMW = require("./utils/errorHandleMW");

app.use(express.json());


app.use(cors({
  origin: '*', 
}));


app.use(express.static(__dirname + '/uploads/images'));
app.use(express.static(__dirname + '/uploads/pdfs'));

app.use('/api/v1/users/', userRouter);
app.use('/api/v1/letters/', letterRouter);


app.use(errorHandleMW);

module.exports = app;