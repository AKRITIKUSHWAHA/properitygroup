import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';

/**
 * Ensures a CUSTOMER user exists in the database `users` table.
 * If not, creates them with status PENDING and a random unusable password hash.
 * Links all matching leads and jobs to this user's clientId.
 */
export const ensureCustomerUser = async ({ email, name, phone }) => {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return null;
  }

  let user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (!user) {
    // Generate random unguessable unusable password hash
    const randomSecret = crypto.randomBytes(32).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomSecret, salt);

    user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: (name || 'Valued Client').trim(),
        phone: phone ? String(phone).trim() : null,
        password: hashedPassword,
        role: 'CUSTOMER',
        status: 'PENDING',
      },
    });
  } else if (user.role === 'CUSTOMER') {
    const updates = {};
    if ((!user.name || user.name === 'Valued Client') && name) {
      updates.name = name.trim();
    }
    if (!user.phone && phone) {
      updates.phone = String(phone).trim();
    }
    if (Object.keys(updates).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updates,
      });
    }
  }

  // Connect jobs and leads to this customer's user.id
  try {
    await prisma.job.updateMany({
      where: { clientEmail: cleanEmail },
      data: {
        clientId: user.id,
      },
    });
  } catch (syncErr) {
    console.error('[ensureCustomerUser job sync error]:', syncErr.message);
  }

  return user;
};

/**
 * Generates a signed, expiring JWT token strictly for portal activation (valid for 48 hours).
 */
export const generateActivationToken = (user) => {
  if (!user || !user.id || !user.email) {
    throw new Error('Valid user record required to generate activation token.');
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email.toLowerCase().trim(),
      purpose: 'portal_activation',
    },
    env.JWT_SECRET,
    { expiresIn: '48h' }
  );
};
