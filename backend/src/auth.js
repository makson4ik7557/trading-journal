import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TTL = '7d';

export const hashPassword = (password) => bcrypt.hashSync(password, 10);
export const comparePassword = (password, hash) => bcrypt.compareSync(password, hash);

export const signToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  SECRET,
  { expiresIn: TTL }
);

export const verifyToken = (token) => {
  try { return jwt.verify(token, SECRET); }
  catch { return null; }
};
