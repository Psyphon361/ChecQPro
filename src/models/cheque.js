import mongoose from 'mongoose';

const chequeSchema = new mongoose.Schema(
  {
    issue_date: {
      type: Date,
      default: Date.now,
      required: true,
    },

    amount_in_words: {
      type: String,
      required: true,
      trim: true,
    },

    amount_figure: {
      type: Number,
      required: true,
    },

    account_number: {
      type: String,
      required: true,
    },

    cheque_number: {
      type: Number,
      required: true,
    },

    is_valid: {
      type: Boolean,
      required: true,
      default: false,
    },

    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'User',
    },
  },

  {
    timestamps: true,
  }
);

const Cheque = mongoose.model('Cheque', chequeSchema);

export default Cheque;
