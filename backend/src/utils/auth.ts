import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

/**
 * Genera un hash seguro de una contraseña utilizando bcryptjs.
 *
 * @param password Contraseña en texto plano
 * @returns Promesa con el hash generado
 */
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compara una contraseña con un hash guardado.
 *
 * @param password Contraseña en texto plano a verificar
 * @param storedHash Hash guardado en la base de datos
 */
export function comparePassword(password: string, storedHash: string): Promise<boolean> {
  return bcrypt.compare(password, storedHash);
}

/**
 * Firma un payload generando un token JWT con jsonwebtoken.
 *
 * @param payload Objeto con los datos a incluir en el token
 * @param secret Clave secreta para firmar el token
 * @param expiresInSeconds Tiempo de expiración en segundos
 */
export function signJwt(payload: object, secret: string, expiresInSeconds: number): string {
  return jwt.sign(payload, secret, { expiresIn: expiresInSeconds });
}

/**
 * Verifica y decodifica un token JWT con jsonwebtoken.
 * Retorna null si la firma es inválida o el token ha expirado.
 *
 * @param token Token JWT a verificar
 * @param secret Clave secreta con la que se firmó el token
 */
export function verifyJwt(token: string, secret: string): any | null {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    console.error('verifyJwt failed:', err);
    return null;
  }
}
