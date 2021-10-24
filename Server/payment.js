
require('dotenv').config()
const express = require('express')
const crypto = require('crypto')
const Razorpay = require('razorpay')
const mongoose =  require('mongoose')




const router =  express.Router();
const instance =  new Razorpay({
    key_id: 'rzp_test_lsw8tzPt7DhYC2',
    key_secret: 'qdfKhu8ps3iGVcR2esywXrJt'
});

// route for initiating payment


const OrderSchema = mongoose.Schema({
    title: String,
    isPaid: Boolean,
    amount: Number,
    razorpay: {
        orderId: String,
        paymentId: String,
        signature:  String, 
    },
});

const Order = mongoose.model('Order', OrderSchema);

router.post('/orders', async (req, res) => {
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





router.get('/list-orders', async (req,res) => {
    const orders = await Order.find();
    res.send(orders);
})

router.post('/failure',async (req, res) => {
    console.log("failure")
})



router.post('/success', async (req,res) => {
    try{
        const {
            title,
            amount,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        }= req.body
        const userPayment =  await User.findOne({ _id: req.userID});
        if(userPayment){

            const newPayment = Order({
                isPaid: true,
                amount: amount / 100,
                title,
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

        }
    }catch(err){
        console.log(err);
        res.status(500).send(err)
    }
});



//route for verify and capture payment
// router.post('/verify', async (req, res) => {
//     try {
//         const{
//             orderCreationId,
//             razorpayPaymentId,
//             razorpayOrderId,
//             razorpaySignature,
//             amount,
//             currency
           
//         }  = req.body;
//         const signature = crypto.createHmac("sha256", process.env.RAZOR_SECRET);
//         signature.update(`${orderCreationId}|${razorpayPaymentId}`);
//         const digest = signature.digest("hex");
        
//         if(digest !==  razorpaySignature)  return res.status(400).json({ msg: 'Transaction not legit' });
//         const captureResponse = await instance.payment.capture(
//             razorpayPaymentId,
//             // amount,
//             currency
//         );
//         return res.status(200).json({
//             status: 'success',
//             orderId: razorpayOrderId,
//             paymentId: razorpayPaymentId,
//             captureResponse
//         });
//     } catch (error) {
//         return res.status(500).send(error);
//     }
// });

module.exports = router;