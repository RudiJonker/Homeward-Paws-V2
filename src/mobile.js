export function mobileDigits(value=''){return value.replace(/\D/g,'').slice(0,10)}
export function formatMobile(value=''){
  const digits=mobileDigits(value);
  return [digits.slice(0,3),digits.slice(3,6),digits.slice(6,10)].filter(Boolean).join(' ');
}
export function isSouthAfricanMobile(value=''){return /^0[6-8][0-9]{8}$/.test(mobileDigits(value))}
export function whatsappNumber(value=''){const digits=mobileDigits(value);return isSouthAfricanMobile(digits)?`27${digits.slice(1)}`:''}
