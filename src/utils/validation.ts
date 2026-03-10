/**
 * Input validation helpers for SDK methods.
 */

import { MpesaValidationError } from "../errors";

const KENYA_PHONE_REGEX = /^254[17]\d{8}$/;

/** Normalize phone to 254XXXXXXXXX. */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 9 && digits.startsWith("7")) return `254${digits}`;
  if (digits.length === 10 && digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("254")) return digits;
  return value;
}

/** Validate Kenya M-Pesa phone format (254XXXXXXXXX). */
export function validatePhone(phone: string): void {
  const normalized = normalizePhone(phone);
  if (!KENYA_PHONE_REGEX.test(normalized)) {
    throw new MpesaValidationError(
      `Invalid phone number: expected Kenya format (254XXXXXXXXX), got: ${phone}`
    );
  }
}

/** Validate required string (non-empty). */
export function requireNonEmpty(value: string | undefined, name: string): asserts value is string {
  if (value === undefined || value.trim() === "") {
    throw new MpesaValidationError(`Missing or empty required field: ${name}`);
  }
}

/** Validate positive integer. */
export function requirePositiveInt(value: number | undefined, name: string): number {
  if (value === undefined || value === null) {
    throw new MpesaValidationError(`Missing required field: ${name}`);
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || Math.floor(n) !== n) {
    throw new MpesaValidationError(`${name} must be a positive integer, got: ${value}`);
  }
  return n;
}

/** Validate positive amount (can be decimal). */
export function requirePositiveAmount(value: number | undefined, name: string): number {
  if (value === undefined || value === null) {
    throw new MpesaValidationError(`Missing required field: ${name}`);
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    throw new MpesaValidationError(`${name} must be a positive number, got: ${value}`);
  }
  return n;
}

/** Validate URL string. */
export function validateUrl(value: string | undefined, name: string): void {
  if (value === undefined || value.trim() === "") {
    throw new MpesaValidationError(`Missing or empty required field: ${name}`);
  }
  try {
    new URL(value);
  } catch {
    throw new MpesaValidationError(`Invalid URL for ${name}: ${value}`);
  }
}
