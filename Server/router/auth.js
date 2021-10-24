const express =  require('express');
const router = express.Router()
const bcrypt  = require("bcrypt")
const autheticate = require("../middleware/autheticate")
const cookieparser=require("cookie-parser");


router.use(express.json())
const User =  require('../models/userSchema');


router.use(cookieparser());
router.post('/login' , async (req,res) => {
    try{
        let token;
        const { username, password } = req.body;

        if(!username || !password){
            return res.status(400).json({error: "Plz Filled the Data"})
        }

        const userLogin = await User.findOne({ username: username});

        if(userLogin){
            const isMatch = await bcrypt.compare(password, userLogin.password);

            token =  await userLogin.generateAuthToken();
            console.log(token)

            res.cookie("jwtoken", token,{
                expires: new Date(Date.now(), 25892000000),
                httpOnly: true
            });

            if(!isMatch){
                res.status(400).json({error: "Invalid Credentials"});

            }else{
                res.json({message: " User Signin Successfully"})
            }
        }else{
            res.status(400).json({error: "Invalid Value"})
        }
    }catch(err){
        console.log(err)
    }
})

router.post("/register", (req, res)=> {
    const {fullname,username, email, password, cpassword} = req.body
    User.findOne({email: email}, (err, user) => {
        if(user){
            return res.status(422).json({ error :"Email already Exist"});
        } else {
            const user = new User({
                fullname,
                username,
                email,
                password,
                cpassword
            })
            user.save().then(() => {
                res.status(201).json({ message: "user registered successfully"});
            }).catch((err) => res.status(500).json({ error: "Failed to registered"}));
        }
    })
    
}) 


router.get('/contact', autheticate ,( req, res) => {
    res.send(req.rootUser);
   
})


router.post('/contact',autheticate, async (req,res) =>{

    try {
        const {fullname, email, message} = req.body;

        if(!fullname, !email, !message){
            console.log("Error in Contact Form")
            return res.json({ error: "Plzz filled the Contact Form"})
        }
        const userContact =  await User.findOne({ _id: req.userID});

        if(userContact){
            const userMessage =  await userContact.addMessage(fullname,email,message)
           await userContact.save();

            res.status(201).json({message: "User Contact Successfully"})
        }
    } catch (error) {
        console.log(error)
    }

})




router.get('/getdata', autheticate ,( req, res) => {
    res.send(req.rootUser); 
})

router.get('/logout' ,( req, res) => {
    console.log('Hello my Logout Page')
    res.clearCookie('jwtoken',{ path: '/'})
    res.status(200).send('Logout Successfully')   
})



module.exports = router;



