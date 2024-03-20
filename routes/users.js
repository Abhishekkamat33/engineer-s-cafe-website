const mongoose= require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/myproject");
const plm=require("passport-local-mongoose")
const myschema=mongoose.Schema({
  username:{
    type:String,
  },
  email:{
    type:String,
  },
  password:{
    type:String,
  },
  admin:{
    type:String,
  },
  dob:{
    type:String,
  },
  gender:{
    type:String,
  },
  })
  myschema.plugin(plm);
  module.exports=mongoose.model("myproject",myschema);
