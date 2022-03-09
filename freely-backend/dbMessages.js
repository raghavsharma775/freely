import mongoose from 'mongoose';

const freelySchema=mongoose.Schema({
    message:String,
    name:String,
    timestamp: String,
    received:Boolean
});

export default mongoose.model('messagecontents',freelySchema);