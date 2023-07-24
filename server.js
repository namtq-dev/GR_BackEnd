const { Server } = require('socket.io');
const { socketServices } = require('./socket');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fileupload = require('express-fileupload');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const { readdirSync } = require('fs');

dotenv.config();

// Database
connectDB().catch((err) => console.log(err));
mongoose.connection.on(
  'error',
  console.error.bind(console, 'Connection error:')
);

async function connectDB() {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log('Connected to the MongoDB Server');
}

const app = express();

const whitelist = [
  process.env.FRONTEND_BASE_URL,
  process.env.FRONTEND_BASE_URL_MESS,
];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(fileupload({ useTempFiles: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Routes
readdirSync('./routes').map((route) =>
  app.use('/', require('./routes/' + route))
);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});

// Socket.io
const io = new Server(server, {
  pingTimeout: 60000, // 1 min timeout
  cors: whitelist,
});

io.on('connection', (socket) => {
  console.log('Socket client connected successfully');
  socketServices(socket, io);
});
