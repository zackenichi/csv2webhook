import type { MappingRow } from "./types";

const DEFAULT_FIELD_MAP: Record<string, string> = {
  firstname: "firstName",
  lastname: "lastName",
  fullname: "fullName",
  name: "fullName",
  email: "email",
  emailaddress: "email",
  phone: "phone",
  phonenumber: "phone",
  mobile: "phone",
  company: "company",
  organization: "company",
  title: "title",
  role: "title",
  address: "address",
  address1: "address1",
  address2: "address2",
  city: "city",
  state: "state",
  province: "state",
  region: "state",
  zip: "postalCode",
  zipcode: "postalCode",
  postalcode: "postalCode",
  country: "country",
  website: "website",
  url: "website",
  linkedin: "linkedIn",
  twitter: "twitter",
  dob: "dateOfBirth",
  birthdate: "dateOfBirth",
  birthday: "dateOfBirth",
};

const normalizeHeader = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const toCamelCase = (value: string) => {
  const parts = value
    .replace(/['"]/g, "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
  if (!parts.length) return "";
  return parts
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
};

export const parseCSV = (text: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((entry) => entry.some((value) => value.trim() !== ""));
};

export const buildMapping = (headers: string[], sampleRow: string[]): MappingRow[] =>
  headers.map((header, index) => {
    const normalized = normalizeHeader(header);
    const defaultKey = DEFAULT_FIELD_MAP[normalized] ?? toCamelCase(header);
    return {
      header,
      key: defaultKey,
      enabled: defaultKey.length > 0,
      sample: sampleRow[index] ?? "",
      source: "csv",
    };
  });
