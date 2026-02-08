/**
 * Converts BigInt and Decimal values for JSON serialization
 * @param obj - Object to serialize
 * @returns Object with BigInt values converted to strings and Decimal values to numbers
 */
export function serializeBigInt<T>(obj: T): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  // Handle Prisma Decimal type (check for toNumber method)
  if (
    typeof obj === "object" &&
    obj !== null &&
    "toNumber" in obj &&
    typeof (obj as any).toNumber === "function"
  ) {
    return (obj as any).toNumber();
  }

  // Handle plain Decimal objects (with s, e, d properties)
  if (
    typeof obj === "object" &&
    "s" in obj &&
    "e" in obj &&
    "d" in obj &&
    Array.isArray((obj as any).d)
  ) {
    // Convert Decimal-like object to number using its properties
    const sign = (obj as any).s;
    const exponent = (obj as any).e;
    const digits = (obj as any).d;

    // Simple conversion for common cases
    const numStr = digits.join("");
    const num =
      parseFloat(numStr) * Math.pow(10, exponent - numStr.length + 1) * sign;
    return num;
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }

  if (typeof obj === "object") {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value);
    }
    return serialized;
  }

  return obj;
}
