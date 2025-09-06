import express from "express";
import { adminRegister, adminLogin } from "../../controllers/admin/adminAuth.js";


const router = express.Router();


router.post("/admin_register", adminRegister);
router.post("/admin_login", adminLogin);


export default router;
