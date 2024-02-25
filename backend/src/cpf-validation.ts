export function isValidCpf(cpf: string): boolean {
  if (!cpf) return false;
  cpf = cleanCpf(cpf);
  if (!isCpfLengthValid(cpf)) return false;
  if (hasAllEqualsDigits(cpf)) return false;
  const firstDigit = calculateDigit(cpf, 10);
  const secondDigit = calculateDigit(cpf, 11);
  return extractVerificationDigit(cpf) === `${firstDigit}${secondDigit}`;
}

function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

function isCpfLengthValid(cpf: string): boolean {
  return cpf.length === 11;
}

function hasAllEqualsDigits(value: string): boolean {
  return value.split("").every((v) => v === value[0]);
}

function calculateDigit(cpf: string, factor: number): string {
  let total = 0;
  for (const digit of cpf) {
    if (factor > 1) total += parseInt(digit) * factor--;
  }
  const rest = total % 11;
  return String(rest < 2 ? 0 : 11 - rest);
}

function extractVerificationDigit(cpf: string): string {
  return cpf.slice(9);
}
