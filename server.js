const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

const SCOPEPAY_URL = "https://scopepay.co.ke/api/initiatestk.php";

const API_KEY = process.env.API_KEY || "YOUR_API_KEY";
const API_SECRET = process.env.API_SECRET || "YOUR_API_SECRET";
const ACCOUNT_ID = process.env.ACCOUNT_ID || "YOUR_ACCOUNT_ID";

function formatPhone(phone) {
  if (phone.startsWith("0")) {
    return "254" + phone.substring(1);
  }
  return phone;
}

app.post("/send-bulk", async (req, res) => {
  const { numbers, amount, reference } = req.body;

  if (!numbers || !amount) {
    return res.status(400).json({ error: "Missing numbers or amount" });
  }

  const results = [];

  for (let phone of numbers) {
    try {
      const formattedPhone = formatPhone(phone);

      const response = await fetch(SCOPEPAY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: API_KEY,
          api_secret: API_SECRET,
          account_id: ACCOUNT_ID,
          amount: amount,
          phone: formattedPhone,
          reference: reference || "BulkPayment"
        })
      });

      const data = await response.json();
      results.push({ phone: formattedPhone, response: data });

      await new Promise(r => setTimeout(r, 1500));

    } catch (error) {
      results.push({ phone, error: error.message });
    }
  }

  res.json(results);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
