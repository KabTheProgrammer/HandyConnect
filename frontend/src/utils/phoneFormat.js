export const COUNTRY_DATA = {
  GH: { name: "Ghana", flag: "🇬🇭", code: "+233", localLength: 9 },
  NG: { name: "Nigeria", flag: "🇳🇬", code: "+234", localLength: 10 },
  US: { name: "United States", flag: "🇺🇸", code: "+1", localLength: 10 }
};

export const formatPhone = (raw, country) => {
  const countryInfo = COUNTRY_DATA[country];
  if (!countryInfo) return raw;

  const { code, localLength } = countryInfo;

  // Remove all non-digits
  let digits = raw.replace(/\D/g, "");

  // Remove leading 0 for GH, NG
  if (["GH", "NG"].includes(country) && digits.startsWith("0")) {
    digits = digits.substring(1);
  }

  digits = digits.substring(0, localLength);

  // Formatting (WhatsApp style)
  if (country === "US") {
    if (digits.length <= 3) return `${code} ${digits}`;
    if (digits.length <= 6) return `${code} ${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${code} ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  // Default: GH, NG
  if (digits.length <= 2) return `${code} ${digits}`;
  if (digits.length <= 5) return `${code} ${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${code} ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
};

export const cleanPhoneForBackend = (country, phone) => {
  if (!country || !COUNTRY_DATA[country]) {
    console.warn("Invalid country passed to cleanPhoneForBackend:", country);

    // fallback: try guessing from leading +233 / +234 etc
    const digits = phone.replace(/[^\d]/g, "");
    return "+" + digits;
  }

  const { code } = COUNTRY_DATA[country]; // safe now
  const digits = phone.replace(/[^\d]/g, "");
  return `${code}${digits.replace(/^0+/, "")}`;
};
