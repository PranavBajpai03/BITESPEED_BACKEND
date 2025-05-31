import { Router } from 'express';
const router = Router();

router.post('/identify', async (req, res) => {
  const { email, phoneNumber } = req.body;
  
  res.status(200).json( { "message": `Received (${email}, ${phoneNumber}) via POST`} )
});

export default router;

