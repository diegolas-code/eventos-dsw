import crypto from 'node:crypto';

/**
 * Genera un hash seguro de una contraseña utilizando PBKDF2.
 *
 * @param password Contraseña en texto plano
 * @returns Hash formateado como 'salt:derivedKey'
 */
export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Compara una contraseña con un hash guardado de forma segura contra ataques de temporización.
 *
 * @param password Contraseña en texto plano a verificar
 * @param storedHash Hash guardado en formato 'salt:derivedKey'
 */
export function comparePassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const parts = storedHash.split(':');
    if (parts.length !== 2) {
      return resolve(false);
    }
    const [salt, hash] = parts;
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) return reject(err);
      const keyBuffer = Buffer.from(hash, 'hex');
      const derivedBuffer = derivedKey;
      if (keyBuffer.length !== derivedBuffer.length) {
        return resolve(false);
      }
      resolve(crypto.timingSafeEqual(keyBuffer, derivedBuffer));
    });
  });
}

/**
 * Codifica una cadena en formato Base64URL.
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Decodifica una cadena en formato Base64URL.
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Firma un payload generando un token JWT localmente con HMAC SHA-256.
 *
 * @param payload Objeto con los datos a incluir en el token
 * @param secret Clave secreta para firmar el token
 * @param expiresInSeconds Tiempo de expiración en segundos
 */
export function signJwt(payload: object, secret: string, expiresInSeconds: number): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const tokenInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto.createHmac('sha256', secret).update(tokenInput).digest('base64url');

  return `${tokenInput}.${signature}`;
}

/**
 * Verifica y decodifica un token JWT localmente.
 * Retorna null si la firma es inválida o el token ha expirado.
 *
 * @param token Token JWT a verificar
 * @param secret Clave secreta con la que se firmó el token
 */
export function verifyJwt(token: string, secret: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const tokenInput = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(tokenInput)
      .digest('base64url');

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && now > payload.exp) {
      return null; // Token expirado
    }

    return payload;
  } catch {
    return null;
  }
}
