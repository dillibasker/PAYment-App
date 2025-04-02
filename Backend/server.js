const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
const stripe = new Stripe("sk_test_51R9TMvRh2qqw6gEr4sUdneh655GJqKq8v97ZpGKQY8qMDm7BkLcTCkOp1qgMTqq8eWYIdM4gKPxd5Reaq310XP9G00PiYPvry3"); // Use your Stripe secret key

app.use(express.json());
app.use(cors());

app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents (e.g., $10 = 1000 cents)
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
