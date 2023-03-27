const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { readdirSync } = require('fs');

dotenv.config();
const app = express();

var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

readdirSync('./routes').map((route) =>
  app.use('/', require('./routes/' + route))
);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}...`);
});
