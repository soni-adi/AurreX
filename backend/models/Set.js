const mongoose=require('mongoose');
const setSchema=new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  image:{type:String,default:''},setName:{type:String,required:true,trim:true},givenBy:{type:String,default:''},
  goldUsed:{type:Number,default:0},totalGems:{type:Number,default:0},gemPrice:{type:Number,default:0},
  persons:{type:[{name:{type:String,default:''},goldUsed:{type:Number,default:0},totalGems:{type:Number,default:0}}],default:[]},
  gemTable:{type:[{gemType:{type:String,default:''},gemWeight:{type:Number,default:0},gemWeightUnit:{type:String,enum:['gram','carat'],default:'gram'},gemPrice:{type:Number,default:0},pricePerGem:{type:Number,default:0},totalGems:{type:Number,default:0}}],default:[]},
  notes:{type:String,default:''},status:{type:String,enum:['active','archived'],default:'active'},
},{timestamps:true});
module.exports=mongoose.model('Set',setSchema);