import { hashSync, compareSync } from 'bcrypt-ts'

export const hashPassword = async (password: string) => {
  return hashSync(password, 10);
}

export const compareHashPassword = async (password: string, hashedPwd: string) => {
  return compareSync(password, hashedPwd);
}
