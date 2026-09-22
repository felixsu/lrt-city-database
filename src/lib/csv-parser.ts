export function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const result: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  // Normalize newlines (strip CR)
  const len = text.length;

  while (i < len) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < len && text[i + 1] === '"') {
          // Escaped quote
          currentField += '"';
          i += 2;
          continue;
        } else {
          // End of quoted field
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ",") {
        currentRow.push(currentField);
        currentField = "";
        i++;
        continue;
      } else if (char === "\r") {
        if (i + 1 < len && text[i + 1] === "\n") {
          i++;
        }
        currentRow.push(currentField);
        currentField = "";
        // Only push non-empty rows
        if (currentRow.some((c) => c.trim().length > 0)) {
          result.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      } else if (char === "\n") {
        currentRow.push(currentField);
        currentField = "";
        if (currentRow.some((c) => c.trim().length > 0)) {
          result.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  // Final field/row if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((c) => c.trim().length > 0)) {
      result.push(currentRow);
    }
  }

  if (result.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = result[0].map((h) => h.trim());
  const rows = result.slice(1);
  return { headers, rows };
}

export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return "";
  let clean = phone.replace(/[^0-9]/g, "");
  // If starts with 62, replace with 0
  if (clean.startsWith("62")) {
    clean = "0" + clean.slice(2);
  }
  return clean;
}

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export function normalizeUnitNumber(unit: string | null | undefined): string {
  return (unit ?? "").trim();
}

export interface CSVConsumerRecord {
  timestamp?: string;
  email: string;
  phone: string;
  name: string;
  sppuNumber: string;
  ppjbNumber: string;
  projectLocation: string;
  towerOrCluster: string;
  unitNumber: string;
  purchasePrice: string;
  paymentType: string;
  loanBankName: string;
  loanTenorMonths: number | null;
  loanMonthsPaid: number | null;
  loanPaymentStatus: string;
  demandType: string;
  materialLossPaid: string;
  materialDetails: string;
  remainingArrears: string;
  otherLosses: string;
  lossBasisCalc: string;
  pinjamPakai: string;
  maxWaitDuration: string;
  compensation: string;
}

export function parseCSVConsumerRows(csvText: string): CSVConsumerRecord[] {
  const { headers, rows } = parseCSV(csvText);
  if (headers.length === 0 || rows.length === 0) return [];

  // Map header index
  const headerMap = new Map<string, number>();
  headers.forEach((h, idx) => {
    headerMap.set(h.toLowerCase().trim(), idx);
  });

  function getVal(row: string[], ...aliases: string[]): string {
    for (const alias of aliases) {
      const idx = headerMap.get(alias.toLowerCase().trim());
      if (idx !== undefined && idx < row.length) {
        return (row[idx] ?? "").trim();
      }
    }
    return "";
  }

  const records: CSVConsumerRecord[] = [];

  for (const row of rows) {
    const email = getVal(row, "email address", "email");
    const phone = getVal(row, "no whatsapp", "no wa", "whatsapp", "phone", "contact number");
    const name = getVal(row, "nama lengkap", "nama", "full name", "name");
    const sppuNumber = getVal(row, "nomor sppu", "sppu", "sppu number");
    const ppjbNumber = getVal(row, "nomor ppjb/sskk", "nomor ppjb", "ppjb", "ppjb number");
    const projectLocation = getVal(row, "lokasi proyek", "proyek", "project");
    const towerOrCluster = getVal(row, "tower atau cluster", "tower", "cluster", "tower/cluster");
    const unitNumber = getVal(row, "unit", "unit number", "nomor unit");
    const purchasePrice = getVal(row, "harga pembelian unit sesuai sppu/ppjb/sskk", "harga pembelian unit", "harga unit", "purchase price");
    const paymentType = getVal(row, "jenis pembayaran", "payment type");
    const loanBankName = getVal(
      row,
      'jika mengisi kpr / kpa, apa bank yang digunakan?',
      "jika mengisi kpr / kpa, apa bank yang digunakan?",
      "bank",
      "bank kpr / kpa",
      "bank kpa"
    );
    const tenorStr = getVal(row, "tenor pinjaman (bulan)", "tenor", "tenor pinjaman");
    const monthsPaidStr = getVal(
      row,
      "sudah berapa bulan pinjaman yang telah dibayarkan",
      "bulan pinjaman dibayarkan",
      "bulan dibayar"
    );
    const loanPaymentStatus = getVal(row, "status pembayaran kpa", "status pembayaran", "status kpa");
    const demandType = getVal(row, "tuntutan", "demand type");
    const materialLossPaid = getVal(
      row,
      "kerugian materiil sesuai yang sudah dibayarkan",
      "kerugian materiil",
      "material loss paid"
    );
    const materialDetails = getVal(row, "rincian materiil", "rincian kerugian materiil", "material details");
    const remainingArrears = getVal(
      row,
      "sisa tunggakan yang masih harus dibayarkan",
      "sisa tunggakan yang masih harus dibayarkan ",
      "sisa tunggakan"
    );
    const otherLosses = getVal(
      row,
      "kerugian materiil dan imateriil lainnya",
      "kerugian materiil dan immateriil lainnya",
      "kerugian immaterial"
    );
    const lossBasisCalc = getVal(
      row,
      "dasar perhitungan kerugian immateriil",
      "dasar perhitungan kerugian",
      "dasar perhitungan"
    );
    const pinjamPakai = getVal(row, "pinjam pakai");
    const maxWaitDuration = getVal(row, "maksimal bersedia menunggu selama", "bersedia menunggu selama");
    const compensation = getVal(row, "kompensasi");
    const timestamp = getVal(row, "timestamp");

    // Only skip completely blank rows
    if (!name && !email && !phone && !unitNumber) continue;

    const loanTenorMonths = tenorStr && !isNaN(parseInt(tenorStr, 10)) ? parseInt(tenorStr, 10) : null;
    const loanMonthsPaid = monthsPaidStr && !isNaN(parseInt(monthsPaidStr, 10)) ? parseInt(monthsPaidStr, 10) : null;

    records.push({
      timestamp,
      email,
      phone,
      name,
      sppuNumber,
      ppjbNumber,
      projectLocation,
      towerOrCluster,
      unitNumber,
      purchasePrice,
      paymentType,
      loanBankName,
      loanTenorMonths,
      loanMonthsPaid,
      loanPaymentStatus,
      demandType,
      materialLossPaid,
      materialDetails,
      remainingArrears,
      otherLosses,
      lossBasisCalc,
      pinjamPakai,
      maxWaitDuration,
      compensation,
    });
  }

  return records;
}
