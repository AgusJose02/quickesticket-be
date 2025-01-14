import jwt from 'jsonwebtoken'


export function decodeToken(token: string) {

  const secretKey = process.env.KEY

  if (!secretKey) { throw new Error('Clave secreta no configurada')}

  const tokenPayload = (jwt.verify(token, secretKey)) as jwt.JwtPayload
  
  const userId = tokenPayload.id
  const userIsAdmin = tokenPayload.isAdmin

  return { userId, userIsAdmin }

}