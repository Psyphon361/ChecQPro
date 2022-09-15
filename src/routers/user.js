import express from 'express';
import shared_data from '../shared-data/shared-vars.js';
const router = new express.Router();

router.get('/', (req, res) => {
  res.render('home', {
    title: 'ChecQPro | Home',
    shared_data,
  });
});

router.get('/signup', (req, res) => {
  res.render('signup', {
    title: 'ChecQPro | Signup',
    shared_data,
  });
});

router.get('/signin', (req, res) => {
  res.render('signin', {
    title: 'ChecQPro | Signin',
    shared_data,
  });
});

export default router;
