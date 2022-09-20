import express from 'express';
import { unlink } from 'fs';
import path from 'path';
import url from 'url';
import fetch from 'node-fetch';
import https from 'https';
import auth from '../middlewares/auth.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Employee from '../models/employee.js';
import Cheque from '../models/cheque.js';
import shared_data from '../shared-data/shared-vars.js';
import '../db/mongoose.js';
import '../oauth/google.js';
import '../oauth/twitter.js';
import Multer from 'multer';
import { Storage } from '@google-cloud/storage';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = Multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const multer = Multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  //   fileFilter: function (_req, file, cb) {
  //     checkFileType(file, cb);
  //   },
});

// function checkFileType(file, cb) {
//   // Allowed ext
//   const filetypes = /jpg/;
//   // Check ext
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   // Check mime
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     shared_data.valid_file_type = true;
//     return cb(null, true);
//   } else {
//     shared_data.valid_file_type = false;
//     cb(null, null);
//   }
// }

const router = new express.Router();

router.get('/add-user', async (req, res) => {
  const new_user = {
    fname: 'Tanish',
    lname: 'Sharma',
    email: 'tanish03jun@gmail.com',
    address: '125/4 Kabul Lines, Delhi 110010',
    phone: '8837692527',
    account_number: '630801551452',
    bank_balance: 10700,
    cheque_start: 100820,
    cheque_end: 100869,
    signature: 'https://storage.googleapis.com/cheque_info/630801551452.jpg',
  };

  // console.log(typeof new_user);

  const user = new User(new_user);

  try {
    await user.save();
    // console.log('Adding New User to DB');
    res.status(201).redirect('/'); // REDIRECT TO REGISTRATION FORM AFTER SIGNUP
  } catch (e) {
    res.status(400);
  }
});

router.get('/', async (req, res) => {
  const token = req.cookies.jwt;
  // console.log(token);
  if (token == null) {
    shared_data.user_is_authenticated = false;
  } else {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const employee = await Employee.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    // console.log(employee);

    if (!employee) {
      shared_data.user_is_authenticated = false;
    } else {
      shared_data.user_is_authenticated = true;
    }
  }
  res.render('home', {
    title: 'ChecQPro | Home',
    shared_data,
  });
});

router.get('/cheque', async (req, res) => {
  res.render('process-cheque', {
    title: 'Process Cheque | ChecQPro',
  });
});

router.post(
  '/cheque',
  auth,
  multer.single('cheque'),
  async (req, res, next) => {
    //   console.log(req.file);
    //   console.log('Uploaded file!');

    const bucketName = 'cheque_info';
    const filePath = './uploads/' + req.file.originalname;
    const destFileName = `${Date.now()}${req.file.originalname}`;
    const generationMatchPrecondition = 0;

    // Creates a client
    const storage = new Storage({
      keyFilename: path.join(__dirname, '../../cheque_processing.json'),
    });

    async function uploadFile() {
      const options = {
        destination: destFileName,
        preconditionOpts: { ifGenerationMatch: generationMatchPrecondition },
      };

      await storage.bucket(bucketName).upload(filePath, options);

      unlink(req.file.path, (err) => {
        if (err) throw err;
      });

      const agent = new https.Agent({
        rejectUnauthorized: false,
      });

      const result = await fetch(
        `https://858b-2402-3a80-db2-47a3-10cc-905e-a8ac-6fb6.in.ngrok.io?cheque=${destFileName}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          agent,
        }
      );

      const cheque_details = await result.json();
      const cheque = new Cheque(cheque_details);

      const this_user = await User.findOne({ account_number: cheque.account_number });

      if (this_user) {
        cheque.customer_id = this_user._id;
        await cheque.save();

        console.log(`${filePath} uploaded to ${bucketName}`);
      } else {
        console.log('Error: User Does Not Exist!');
      }
    }

    uploadFile().catch(console.error);

    res.redirect('/');
  }
);

router.get('/signup', (req, res) => {
  res.render('signup', {
    title: 'ChecQPro | Signup',
    shared_data,
  });
});

router.post('/signup', async (req, res) => {
  shared_data.email_flag = false;

  // const re =
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  // if (!re.test(req.body.password)) {
  //   shared_data.strong_password = false;
  //   res.redirect('/signup');
  // } else {
  shared_data.strong_password = true;
  const employee = new Employee(req.body);

  const existing_employee = await Employee.findOne({ email: employee.email });

  console.log(existing_employee);

  if (existing_employee) {
    shared_data.email_flag = true;
    res.redirect('/signup');
  } else {
    try {
      await employee.save();
      const token = await employee.generateAuthToken();

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: false,
      });

      shared_data.user_is_authenticated = true;

      res.status(201).redirect('/register'); // REDIRECT TO REGISTRATION FORM AFTER SIGNUP
    } catch (e) {
      res.status(400);
    }
  }
  // }
});

router.get('/signin', (req, res) => {
  if (shared_data.user_is_authenticated) {
    res.redirect('/');
  } else {
    res.render('signin', {
      title: 'ChecQPro | Signin',
      shared_data,
    });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const employee = await Employee.findByCredentials(
      req.body.email,
      req.body.password
    );

    if (shared_data.valid_user == false) {
      res.redirect('/signin');
    } else {
      const token = await employee.generateAuthToken();

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: false, // !!!!!------ MAKE IT SECURE BEFORE HOSTING --------!!!!!!
      });

      shared_data.user_is_authenticated = true;

      res.redirect('/');
    }
  } catch (e) {
    res.status(400).send();
  }
});

// GOOGLE OAUTH

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/signup' }),
  async function (req, res) {
    const user = req.user;
    const token = await user.generateAuthToken();

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
    });

    shared_data.user_is_authenticated = true;

    res.status(201).redirect('/register'); // REDIRECT TO REGISTRATION FORM AFTER SIGNUP
  }
);

// TWITTER OAUTH

router.get(
  '/twitter',
  passport.authenticate('twitter', { scope: ['user:email'] })
);

router.get(
  '/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/signup' }),

  async function (req, res) {
    const user = req.user;
    const token = await user.generateAuthToken();

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
    });

    shared_data.user_is_authenticated = true;

    res.status(201).redirect('/register'); // REDIRECT TO REGISTRATION FORM AFTER SIGNUP
  }
);

router.get('/logout', auth, async (req, res) => {
  try {
    req.employee.tokens = req.employee.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.employee.save();
    shared_data.user_is_authenticated = false;
    res.redirect('/');
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/register', auth, async (req, res) => {
  const employee = req.employee;

  if (!(employee.fname == '*_*')) {
    // ALREADY REGISTERED USERS NOT ALLOWED TO ACCESS /register
    res.redirect('/');
  } else {
    res.render('registration-form', {
      title: 'ChecQPro | Register',
      email: employee.email,
      shared_data,
    });
  }
});

router.post('/register', auth, async (req, res) => {
  const requestedUpdates = Object.keys(req.body);
  console.log(req.body);
  const allowedUpdates = [
    'fname',
    'lname',
    'department',
    'mobile_number',
    'employee_id',
    'id_card',
  ];

  const isValidOperation = requestedUpdates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const employee = req.employee;
    requestedUpdates.forEach((update) => (employee[update] = req.body[update]));

    await employee.save();

    shared_data.employee_is_authenticated = true;

    res.status(201).redirect('/');
  } catch (e) {
    res.status(400).send(e);
  }
});

export default router;
