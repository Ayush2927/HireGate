import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

// Hashing of plain text password using a random 16-byte salt+scrypt.
export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString('hex');
    return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
    const parts = storedHash.split(':');

    if (parts.length !== 2) {
        return false;
    }

    const [salt, keyHex] = parts;

    if (!salt || !keyHex) {
        return false;
    }

    const keyBuffer = Buffer.from(keyHex, 'hex');

    const derivedBuffer = scryptSync(password, salt, KEY_LENGTH);

    if (keyBuffer.length !== derivedBuffer.length) {
        return false;
    }

    return timingSafeEqual(keyBuffer, derivedBuffer);
}