const mongoose=require('mongoose');
const gw=new mongoose.Schema({red:{type:Number,default:0},green:{type:Number,default:0},white:{type:Number,default:0},blue:{type:Number,default:0}},{_id:false});
const gcC=new mongoose.Schema({name:{type:String,default:''},count:{type:Number,default:0}},{_id:true});
const gcS=new mongoose.Schema({pakalGems:{type:Number,default:0},tacchiGems:{type:Number,default:0},customTypes:{type:[gcC],default:[]}},{_id:false});
const projectSchema=new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  projectType:{type:String,enum:['detailed','simple'],default:'detailed'},
  image:{type:String,default:''},
  setName:{type:String,required:true,trim:true},
  givenBy:{type:String,required:true,trim:true},
  startDate:{type:String,default:()=>new Date().toISOString().split('T')[0]},
  submissionDate:{type:String,default:()=>{const d=new Date();d.setDate(d.getDate()+30);return d.toISOString().split('T')[0];}},
  wastagePercent:{type:Number,default:0},
  payPerGem:{type:Number,default:0},
  status:{type:String,enum:['ongoing','completed'],default:'ongoing'},
  goldOperations:{type:[{type:{type:String,enum:['add','remove','waste_remove','tach_remove'],required:true},amount:{type:Number,default:0},note:{type:String,default:''},createdAt:{type:Date,default:Date.now}}],default:[]},
  gemPackingTable:{type:[{userName:{type:String,default:''},gems:{type:Number,default:0}}],default:[]},
  gemSettingTable:{type:[{userName:{type:String,default:''},gems:{type:Number,default:0}}],default:[]},
  pakalTable:{type:[{user:{type:String,default:''},itemWeightBefore:{type:Number,default:0},goldGiven:{type:Number,default:0},itemWeightAfter:{type:Number,default:0},goldReceived:{type:Number,default:0},wasteGoldTaken:{type:Number,default:0},gems:{type:Number,default:0}}],default:[]},
  tachhiTable:{type:[{user:{type:String,default:''},itemWeightBefore:{type:Number,default:0},itemWeightAfter:{type:Number,default:0},tach:{type:Number,default:0},gems:{type:Number,default:0}}],default:[]},
  gemWeight:{type:gw,default:()=>({})},
  totalGems:{type:Number,default:0},
  gemsPrice:{type:Number,default:0},
  addDataSections:{type:[{name:{type:String,default:''},totalGoldUsed:{type:Number,default:0},totalGems:{type:Number,default:0},gemPrice:{type:Number,default:0},gemWeight:{type:gw,default:()=>({})}}],default:[]},
  gemCount:{type:gcS,default:()=>({})},
  notes:{type:String,default:''},
},{timestamps:true});
module.exports=mongoose.model('Project',projectSchema);