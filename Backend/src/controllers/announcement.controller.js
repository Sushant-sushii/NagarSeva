const Announcement = require('../model/Announcement.model');
const User = require('../model/User.model');

/**
 * Get all announcements sorted by creation date (newest first)
 */
async function getAllAnnouncements(req, res) {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    console.error('Get all announcements error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
}

/**
 * Create a new announcement (Official/Admin only)
 */
async function createAnnouncement(req, res) {
  try {
    const { title, content, imageUrl } = req.body;

    // Check authorization: only officials or admin can post announcements
    if (req.user.role !== 'official' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only municipal officials can post announcements.'
      });
    }

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content text are required.'
      });
    }

    // Retrieve official user details to populate fields
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Official user not found.'
      });
    }

    const officialName = `${user.firstName} ${user.LastName}`;
    const department = user.department || 'General Administration';

    const newAnnouncement = new Announcement({
      title,
      content,
      imageUrl: imageUrl || '',
      officialId: req.user.userId,
      officialName,
      department
    });

    await newAnnouncement.save();

    return res.status(201).json({
      success: true,
      message: 'Announcement posted successfully.',
      announcement: newAnnouncement
    });

  } catch (error) {
    console.error('Create announcement error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating announcement',
      error: error.message
    });
  }
}

module.exports = {
  getAllAnnouncements,
  createAnnouncement
};
