export function numberInputValue(value: number | null | undefined) {
  return value ? String(value) : '';
}

export function parseNumberInput(value: string) {
  return value === '' ? 0 : Number(value);
}
