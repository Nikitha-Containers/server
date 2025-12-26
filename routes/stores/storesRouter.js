import express from "express";

const router = express.Router();

router.post("/add", async (req, res) => {
  console.log("req", req.body);
  res.json("Excel uploaded");
});

export default router;