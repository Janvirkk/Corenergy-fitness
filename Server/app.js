const dotenv = require('dotenv')
require('dotenv').config()
const express =  require('express');
const cors =  require('cors')
const router = new express.Router();
dotenv.config({path: './config.env'});
const Razorpay = require('razorpay')
const mongoose =  require('mongoose')

const PORT = process.env.PORT
const app =  express();

require('./db/conn')
app.use(cors());
app.use(require('./router/auth'))
app.use(express.json({ extended: false}));
// app.use("/payment" ,require('./payment'));
// app.use('/list-orders',require('./payment'))

app.use(express.json())




const instance =  new Razorpay({
    key_id: 'rzp_test_lsw8tzPt7DhYC2',
    key_secret: 'qdfKhu8ps3iGVcR2esywXrJt'
});

// route for initiating payment



const OrderSchema = mongoose.Schema({
    title: String,
    image: String,
    isPaid: Boolean,
    amount: Number,
    razorpay: {
        orderId: String,
        paymentId: String,
        signature:  String, 
    },
});
const Order = mongoose.model('Order', OrderSchema);


app.post('/orders', async (req, res) => {
        console.log("ordering")
        try {
            const options = {
                amount: req.body.amount * 100,
                currency: 'INR',
            };
            const order =  await instance.orders.create(options);
            if (!order) return res.status(500).send("Some error occured");
            return res.status(200).json(order);
        } catch (error) {
            res.status(500).json({error})
        }
    
        
})

app.get('/list-orders', async (req,res) => {
    const orders = await Order.find();
    res.send(orders);
})

// app.delete('/delete-order', async (req,res) => {
//     var id = req.params.id
//     const data = await Order.findOneAndDelete({_id: id}, function(err){
//         if(err){
//             console.log(err);
//             return res.status(500).send()
//         }
//         return res.status(200).send()
//     });
// });

app.post('/failure',async (req, res) => {
    console.log("failure")
})

app.post('/success', async (req,res) => {
    try{
        const {
            amount,
            image,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        }= req.body
        const newPayment = Order({
            title: req.body.title,
            image: req.body.image,
            isPaid: true,
            amount: amount / 100,
            razorpay: {
                orderId: razorpayOrderId,
                paymentId: razorpayPaymentId,
                signature: razorpaySignature,
            },
        });
        await newPayment.save();
        res.send({
            msg: "Payment was Successfull",
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err)
    }
});



app.use(router);

app.listen(PORT, () => {
    console.log(`server running at ${PORT}`)
})

