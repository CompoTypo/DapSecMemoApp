require('dotenv').config()
import * as express from 'express';
import * as session from 'express-session';
import * as path from 'path';
import { json, urlencoded } from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as cors from 'cors';

var accountRouter = require('./routes/account');
var forumRouter = require('./routes/forum');

const app = express();

// for body parser
app.use(urlencoded({ extended: true }));
app.use(json());

// for cors
app.use(cors({
  origin: '*',
  methods: 'GET, POST, PUT, DELETE, OPTION',
  allowedHeaders: '*',
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// EACH MICROSERVICE ORGANIZED BY ROUTE
// Attempt to consolidate each microservice into one file 
// Utilize the models for inheritant data processing
app.use('/account', accountRouter);
app.use('/forum', forumRouter);

app.listen(process.env.SRV_PORT, function () {
  console.log("Server is running on port: " + process.env.SRV_PORT);
});
