export function isValidEmail(email: string){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) }
export type PasswordCriteria = { length:boolean; upper:boolean; lower:boolean; number:boolean; symbol:boolean }
export function checkPasswordCriteria(pw: string): PasswordCriteria { return { length: pw.length>=8, upper:/[A-Z]/.test(pw), lower:/[a-z]/.test(pw), number:/[0-9]/.test(pw), symbol:/[^A-Za-z0-9]/.test(pw) } }
export function passwordScore(pw: string): number { const c=checkPasswordCriteria(pw); return (c.length?1:0)+(c.upper?1:0)+(c.lower?1:0)+(c.number?1:0)+(c.symbol?1:0) }
