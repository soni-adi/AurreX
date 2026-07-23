const mongoose=require('mongoose');
const gw=new mongoose.Schema({red:{type:Number,default:0},green:{type:Number,default:0},white:{type:Number,default:0},blue:{type:Number,default:0}},{_id:false});
const se=new mongoose.Schema({setName:{type:String,default:''},goldWeight:{type:Number,default:0},totalGem:{type:Number,default:0},gemWeight:{type:gw,default:()=>({})},gemPrice:{type:Number,default:0},amount:{type:Number,default:0},totalPayment:{type:Number,default:0},date:{type:String,default:''}},{_id:true});
const pe=new mongoose.Schema({date:{type:String,default:''},amount:{type:Number,default:0},note:{type:String,default:''}},{_id:true});
const ge=new mongoose.Schema({date:{type:String,default:''},goldWeight:{type:Number,default:0}},{_id:true});
const gme=new mongoose.Schema({setName:{type:String,default:''},gem:{type:Number,default:0},pricePerGem:{type:Number,default:0},amount:{type:Number,default:0},date:{type:String,default:''}},{_id:true});
const connectionSchema=new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  connectionMode:{type:String,enum:['leader','staff','manager'],default:'leader'},
  name:{type:String,required:true,trim:true},
  image:{type:String,default:''},
  type:{type:String,enum:['Boss','Mates','Staff','Payment'],required:true},
  notes:{type:String,default:''},
  setEntry:{type:[se],default:[]},paymentEntry:{type:[pe],default:[]},goldEntry:{type:[ge],default:[]},
  giveSetEntry:{type:[se],default:[]},givePaymentEntry:{type:[pe],default:[]},giveGoldEntry:{type:[ge],default:[]},
  takeSetEntry:{type:[se],default:[]},takePaymentEntry:{type:[pe],default:[]},takeGoldEntry:{type:[ge],default:[]},
  gemEntry:{type:[gme],default:[]},staffPaymentEntry:{type:[pe],default:[]},
  paymentGiven:{type:[pe],default:[]},paymentReceived:{type:[pe],default:[]},
  managerSetEntry:{type:[se],default:[]},managerPaymentEntry:{type:[pe],default:[]},
},{timestamps:true});
module.exports=mongoose.model('Connection',connectionSchema);