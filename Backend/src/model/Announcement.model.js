const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  officialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  officialName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
