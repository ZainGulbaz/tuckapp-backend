import * as jwt from 'jsonwebtoken';
import 'dotenv/config';

export function generateToken(id: number, role: string, phoneNumber: string) {
  return jwt.sign(
    {
      id,
      role,
      phoneNumber,
    },
    process.env.JWT_SECRET,
  );
}
