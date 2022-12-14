// PACKAGE IMPORTS
import dotenv from 'dotenv';
import path from 'path';
import url from 'url';
import express from 'express';
import userRouter from './routers/user.js';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';

// CONFIGURATIONS
dotenv.config();
const app = express();
app.use(cookieParser());
// app.use(
//   cookieSession({
//     name: 'BOB',
//     keys: ['key1', 'key2'],
//   })
// );
app.use(
  cookieSession({
    name: 'BOB',
    keys: [process.env.TWITTER_ACCESS_TOKEN, process.env.TWITTER_ACCESS_SECRET],
  })
);

// Define paths for express config
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectoryPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');
const port = process.env.PORT;

// File uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('view engine', 'ejs'); // Setup ejs engine
app.set('views', viewsPath);
app.use(express.static(publicDirectoryPath)); // Setup static directory to serve
app.use(userRouter);

app.get('/*', (req, res) => {
  res.render('404');
});

app.listen(port, function () {
  console.log('Server started on port ' + port);
});
