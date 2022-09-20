import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
// require('dotenv').config({ path: 'ENV_FILENAME' });

mongoose.connect(process.env.MONGODB_URL);
// mongoose.connect('mongodb://127.0.0.1:27017/cheqcpro');
