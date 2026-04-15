export interface ParsedField {
  value: string | number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2] as percentage of page dimensions
  page: number;
  confidence?: number;
}

export interface ParsedBillResponse {
  fields: Record<string, ParsedField>;
  status: "success" | "error";
  error?: string;
}

export const mockParsedBill: ParsedBillResponse = {
  status: "success",
  fields: {
    bill_number: {
      value: "INV-2024-00483",
      bbox: [62, 8, 88, 12],
      page: 1,
      confidence: 0.98,
    },
    date: {
      value: "2024-01-15",
      bbox: [62, 14, 82, 18],
      page: 1,
      confidence: 0.97,
    },
    due_date: {
      value: "2024-02-14",
      bbox: [62, 20, 82, 24],
      page: 1,
      confidence: 0.95,
    },
    vendor_name: {
      value: "Acme Cloud Services Inc.",
      bbox: [5, 8, 40, 12],
      page: 1,
      confidence: 0.99,
    },
    vendor_address: {
      value: "1234 Technology Drive, Suite 500, San Francisco, CA 94105",
      bbox: [5, 13, 45, 20],
      page: 1,
      confidence: 0.92,
    },
    customer_name: {
      value: "Widget Corp",
      bbox: [5, 30, 35, 34],
      page: 1,
      confidence: 0.96,
    },
    subtotal: {
      value: 485.0,
      bbox: [70, 75, 90, 79],
      page: 1,
      confidence: 0.94,
    },
    tax: {
      value: 42.78,
      bbox: [70, 80, 90, 84],
      page: 1,
      confidence: 0.93,
    },
    total_amount: {
      value: 527.78,
      bbox: [70, 86, 90, 91],
      page: 1,
      confidence: 0.99,
    },
    payment_method: {
      value: "Wire Transfer",
      bbox: [5, 60, 35, 64],
      page: 2,
      confidence: 0.88,
    },
    notes: {
      value: "Payment due within 30 days. Late fees of 1.5% per month apply.",
      bbox: [5, 70, 80, 76],
      page: 2,
      confidence: 0.85,
    },
  },
};

export async function mockParseBill(
  _file: File
): Promise<ParsedBillResponse> {
  // Simulate network delay with parsing steps
  await new Promise((r) => setTimeout(r, 1500));
  return mockParsedBill;
}

/**
 * Call the real FastAPI backend to parse a PDF bill.
 * Backend must be running at http://localhost:8000
 *
 * Note: bbox values returned are percentages (0–100) of page dimensions
 * with Y-axis flipped to match PDF.js (top-left origin).
 * The 'confidence' field is a fuzzy match score, not a model probability.
 */
export async function parseBill(file: File): Promise<ParsedBillResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
  const response = await fetch(`${apiUrl}/parse-bill`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMsg = `Server error: ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore parse failure
    }
    return { status: "error", error: errorMsg, fields: {} };
  }

  const data = await response.json();
  return data as ParsedBillResponse;
}
