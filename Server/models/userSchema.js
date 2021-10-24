const mongoose = require('mongoose');
const bcrypt   =  require("bcrypt");
const jwt =  require('jsonwebtoken')

const userSchema = new mongoose.Schema({

    fullname: {
      type: String
    },
    username:{
        type:String
    },
    email:{
        type:String
       
    },
    password:{
        type:String
        
    },
    cpassword:{
        type:String
    },
    date: {
      type: Date,
      default: Date.now
    },
    messages: [
      {
        fullname: {
          type: String
        },
        email:{
          type:String  
        },
        message:{
          type:String
        }

      }
    ],
    tokens: [
      {
        token:{
          type: String,
          required:true
        }
      }
    ]
})

userSchema.pre('save', async function (next){
  if(this.isModified('password')){
    this.password = await bcrypt.hash(this.password, 12);
    this.cpassword = await bcrypt.hash(this.cpassword, 12);
  }
  next();
})

userSchema.methods.generateAuthToken = async function () {
  try{
    let token = jwt.sign({ _id:this._id}, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token:token });
    await this.save();
    return token;
  }catch(err){
    console.log(err)
  }
}


userSchema.methods.addMessage = async function (fullname,email, message){
  try{
    this.messages = this.messages.concat({fullname,email,message});
    await this.save();
    return this.messages;
  }catch(error){
    console.log(error)
  }
}

const User =  mongoose.model('USER',userSchema);

module.exports = User;