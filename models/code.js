const mongoose = require('mongoose');

const { Schema } = mongoose;

const codeSchema = new Schema({
  code: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('Code', codeSchema);
