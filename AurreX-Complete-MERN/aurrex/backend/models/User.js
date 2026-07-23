const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const s = new mongoose.Schema({
  username:{ type:String,required:true,unique:true,trim:true,lowercase:true },
  email:{ type:String,required:true,unique:true,trim:true,lowercase:true },
  password:{ type:String,required:true },
  isVerified:{ type:Boolean,default:false },
  otp:{ code:String, expiresAt:Date },
  refreshTokens:[{ type:String }],
},{ timestamps:true });
s.pre('save',async function(next){ if(!this.isModified('password')) return next(); this.password=await bcrypt.hash(this.password,12); next(); });
s.methods.comparePassword=function(p){ return bcrypt.compare(p,this.password); };
s.methods.toJSON=function(){ const o=this.toObject(); delete o.password; delete o.otp; delete o.refreshTokens; return o; };
module.exports=mongoose.model('User',s);