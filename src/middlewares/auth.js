import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import Employee from '../models/employee.js';

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (token == null) return res.sendStatus(401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const employee = await Employee.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!employee) {
      throw new Error();
    }

    req.token = token;
    req.employee = employee;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

export default auth;
