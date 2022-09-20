import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      trim: true,
    },

    lname: {
      type: String,
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

    address: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    account_number: {
      type: String,
      required: true,
      trim: true,
    },

    bank_balance: {
      type: Number,
      required: true,
    },

    cheque_start: {
      type: Number,
      required: true,
    },

    cheque_end: {
      type: Number,
      required: true,
    },

    signature: {
      type: String,
      required: true,
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);

userSchema.virtual('cheques', {
  ref: 'Cheque',
  localField: 'account_number',
  foreignField: 'customer_id',
});

const User = mongoose.model('User', userSchema);

export default User;
