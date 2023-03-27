const express = require('express');
const cors = require('cors');
const { readdirSync } = require('fs');

const app = express();

var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

readdirSync('./routes').map((route) =>
  app.use('/', require('./routes/' + route))
);

app.listen(8000, () => {
  console.log('server is listening...');
});
