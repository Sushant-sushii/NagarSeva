const mongoose = require('mongoose');

const ComplainSchema = new mongoose.Schema({
  // Links the complaint directly to the citizen who reported it
  citizenId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // GeoJSON format for latitude and longitude (Crucial for Heatmaps & Leaflet)
  location: {
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], // [longitude, latitude] -> MongoDB standard order!
      required: true 
    }
  },
  
  // Automated sorting fields populated by the Gemini AI Agent
  description: {
    type: String,
    required: true
  },
  category: { 
    type: String, 
    required: true // e.g., 'Streetlight Out', 'Blocked Drain', 'Illegal Dumping', 'Encroachment'
  },
  department: { 
    type: String, 
    required: true // e.g., 'Electrical', 'Sanitation', 'Public Works', 'Traffic Police'
  },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  officialSummary: { 
    type: String 
  },
  isSafetyHazardAtNight: { 
    type: Boolean, 
    default: false // Set to true by Gemini if it affects night safety (lights out, unsafe zone)
  },
  
  // Image handling
  imageUrl: { 
    type: String // Stores the Base64 string or image hosting URL path
  },
  
  // Tracking & Accountability parameters
  status: { 
    type: String, 
    enum: ['Open', 'Resolved', 'Escalated'], 
    default: 'Open' 
  },
  wardNumber: { 
    type: String, 
    required: true // Used to group statistics on the public Ward Dashboard (e.g., "Ward A")
  },
  localArea: {
    type: String
  },
  resolvedAt: { 
    type: Date // Populated manually when an official resolves the ticket to calculate response times
  },
  resolutionStatement: {
    type: String,
    default: ''
  },
  resolvedByOfficialName: {
    type: String,
    default: ''
  }
}, { 
  // Automatically creates and manages 'createdAt' and 'updatedAt' timestamps!
  timestamps: true 
});


module.exports = mongoose.model('Complain', ComplainSchema);