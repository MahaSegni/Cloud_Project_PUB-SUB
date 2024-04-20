const mongoose= require("mongoose")
require("dotenv").config({path : "./config/.env"})

//
mongoose.connect("mongodb+srv://"+process.env.DB_USER_PASS+"@chatgcloud.rzcvbc6.mongodb.net/chatgcloud",
{ useNewUrlParser: true,
    useUnifiedTopology: true,

},
(err)=>{
    if(!err) console.log("mongo connected");
    else console.log(err);
});