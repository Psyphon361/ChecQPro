import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import foc from 'mongoose-findorcreate';
var findOrCreate = foc;
import shared_data from '../shared-data/shared-vars.js';

const employeeSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      default: '*_*',
      required: true,
      trim: true,
    },

    lname: {
      type: String,
      default: '*_*',
      required: false,
      trim: true,
    },

    department: {
      type: String,
      default: '*_*',
      required: false,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid!');
        }
      },
    },

    password: {
      type: String,
      trim: true,
      minlength: 6,
      default: 'NOPASS',
    },

    mobile_number: {
      type: Number,
      default: 0,
      required: true,
    },

    employee_id: {
      type: Number,
      default: 0,
      required: true,
    },

    id_card: {
      type: String,
      default: '*_*',
      required: true,
      trim: true,
    },

    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },

  {
    timestamps: true,
  }
);

// GENERATE AUTH TOKEN USING JWT
employeeSchema.methods.generateAuthToken = async function () {
  const employee = this;
  const token = jwt.sign({ _id: employee._id.toString() }, process.env.JWT_SECRET);

  employee.tokens = employee.tokens.concat({ token });
  await employee.save();

  return token;
};

employeeSchema.statics.findByCredentials = async (email, password) => {
  const employee = await Employee.findOne({ email });

  if (!employee) {
    shared_data.valid_user = false;
    return undefined;
    // throw new Error("Unable to login!");
  }

  const isMatch = await bcrypt.compare(password, employee.password);

  if (!isMatch) {
    shared_data.valid_user = false;
    return undefined;
    // throw new Error("Unable to login!");
  }

  shared_data.valid_user = true;
  return employee;
};

// HASH PLAIN TEXT PASSWORDS
employeeSchema.pre('save', async function (next) {
  const employee = this;

  if (employee.isModified('password')) {
    employee.password = await bcrypt.hash(employee.password, 8);
  }

  next();
});

employeeSchema.plugin(findOrCreate);

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
