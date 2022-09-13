import express from 'express';
import shared_data from '../shared-data/shared-vars.js';
const router = new express.Router();

router.get('/', (req, res) => {
  res.render('home', {
    title: 'checQPro | Home',
    shared_data,
  });
});

export default router;
