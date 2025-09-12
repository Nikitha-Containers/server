import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In real case, store this in DB (per user)
let userSecret = null;

// Generate 2FA Secret and QR Code
app.get("/api/generate-2fa", async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: "MyApp (Madhavan)",
  });

  userSecret = secret.base32; // store secret (DB in real case)

  // Generate QR Code
  const qrCodeImageUrl = await qrcode.toDataURL(secret.otpauth_url);

  res.json({
    qrCode: qrCodeImageUrl,
    secret: secret.base32, // don’t send secret to frontend in real apps
  });
});

// Verify OTP
app.post("/api/verify-2fa", (req, res) => {
  const { token } = req.body;

  const verified = speakeasy.totp.verify({
    secret: userSecret,
    encoding: " ",
    token,
    window: 1, // allow some leeway
  });

  if (verified) {
    res.json({ success: true, message: "✅ 2FA Verified Successfully!" });
  } else {
    res.json({ success: false, message: "❌ Invalid Token" });
  }
});

app.listen(8001, () => {
  console.log("Server running on 🫡  http://localhost:8001");
});
