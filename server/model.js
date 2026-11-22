const {Schema,model}=require('mongoose');
module.exports=model('Note',new Schema({slug:String,key:String,html:String},{timestamps:true}).index({slug:1,key:1},{unique:true}));
