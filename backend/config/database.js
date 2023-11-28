const mongoose= require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDatabase=async () =>{
   await mongoose.connect(process.env.DB_LOCAL_URI,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then (con=>{
        console.log(`mongoDB is connected to the host: ${con.connection.host}`);
    })
};

module.exports = connectDatabase;