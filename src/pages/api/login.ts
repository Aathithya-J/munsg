// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { password } = req.body;
    if (password === process.env.ADMIN) {
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid admin value' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
