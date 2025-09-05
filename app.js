import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'


dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())

// Mongo DB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Mongo DB Connected ✔"))
    .catch((err) => console.error("Mongo DB Connection Failed", err)
)
    
//Server Connection
app.listen(process.env.PORT, () => {
    console.log(`Server Running on ${process.env.PORT}`);

})