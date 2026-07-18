const mongoose=require("mongoose");
const {exit}=require ("node:process")


async function connectDB(){
    const mongoUri=process.env.MONGO_URI || process.env.MONGODB_URI;

    if(!mongoUri){
        console.error("Missing MongoDB URI. Set MONGO_URI or MONGODB_URI in your environment.");
        exit(1);
    }

    try{
        await mongoose.connect(mongoUri,{
            dbName: 'Mars'
        });
        console.log("Connected to MongoDB");
    }
    catch(err){
        console.error("Error connecting to database:", err);
        exit(1);
    }
}

module.exports=connectDB;