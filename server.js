const express = require('express');
const cors = require('cors');

const app = express();

var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('welcome from home');
});

app.listen(8000, () => {
  console.log('server is listening...');
});
