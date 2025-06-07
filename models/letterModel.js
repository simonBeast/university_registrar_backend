const mongoose = require('mongoose');

const letterSchema = new mongoose.Schema({
    referenceNumber:{
        type:String,
    },
    file:{
        type:String,
    },
    approvedDate:{
        type:Date,
        default: null,
    },
    declinedDate:{
        type:Date,
        default: null,
    },
    approvedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    declinedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    requestedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    letterType:{
        type: String,
        required:[true,"Please enter your letter type"],
    },
    requesterRole:{
        type:String,
        required:[true,"Please enter your Role of requester"],
    }, 
    isApproved:{
        type:Boolean,
        default: null,
    }, 
    isDeclined:{
        type:Boolean,
        default: null,
    }

    
},{timestamps:true})

const CounterSchema = new mongoose.Schema({
    _id: String,
    seq: Number,
  });
  
const Counter = mongoose.model('Counter', CounterSchema);

letterSchema.pre('save', async function (next) {
    if (this.isNew) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'letter' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.referenceNumber = `ref/${counter.seq}/${new Date(Date.now()).getFullYear()}`;
    }
    next();
  });

letterSchema.index({ approvedBy: 1 });
letterSchema.index({ approvedDate: 1 });
letterSchema.index({ createdAt: -1 });
letterSchema.index({ declinedBy: 1 });
letterSchema.index({ requestedBy: 1 });
letterSchema.index({ declinedDate: 1 });
letterSchema.index({ referenceNumber: 1 });

module.exports = mongoose.model("Letter",letterSchema);