const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName:
   { type: String,
     required: true 
    },
  LastName:
  {type:String,
    required:true
},
  email:
   { type: String,
     required: true,
      unique: true 
    },
      
  password:
   { type: String,
     required: true
     }, 
  role:
   { type: String,
     enum: ['citizen', 'official'],
      default: 'Citizen'
     },
     wardLocation:{
      type: String,
      required: true
     },
  department:
   { type: String,
    default:'null'

    }, // Used if role is Official (e.g., 'Electrical')
 // Used if role is Official
}, { timestamps: true });

const userModel=mongoose.model('User', UserSchema);
module.exports = userModel;