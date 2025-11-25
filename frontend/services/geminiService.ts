
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, CATEGORIES } from "../types";

// Initialize Gemini
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
 console.warn("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

const MODEL_NAME = "gemini-2.5-flash";

/**
 * Parses natural language input into a structured transaction object.
 */
export const parseTransactionInput = async (input: string): Promise<Partial<Transaction>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Extract a list of transaction details from this Vietnamese text: "${input}". 
      Today is ${new Date().toISOString().split('T')[0]}.
      
      Specific Rules for Vietnam Context:
      1. Map the category to one of these exact values: ${CATEGORIES.join(', ')}.
      2. Detect amount carefully: 
         - "50k" or "50 nghìn" means 50000.
         - "1 triệu" or "1m" means 1000000.
         - "5 loét" is slang for 500000.
         - Return the amount as a pure number (e.g. 50000).
      3. If the text implies income (e.g., "nhận lương", "bán được", "được chuyển khoản"), set type to 'income', otherwise 'expense'.
      4. Description should be short and clear in Vietnamese.
      5. Split multiple distinct actions into separate transactions.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              date: { type: Type.STRING, description: "YYYY-MM-DD format" },
              type: { type: Type.STRING, enum: ["income", "expense"] }
            },
            required: ["amount", "description", "type"]
          }
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      // Ensure we always return an array
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Error parsing transaction:", error);
    throw error;
  }
};

/**
 * Generates financial insights based on transaction history.
 */
export const generateSpendingInsights = async (transactions: Transaction[]): Promise<string> => {
  try {
    // Prepare a summarized view to save tokens
    const simplifiedData = transactions.map(t => 
      `${t.date}: ${t.type === 'income' ? 'Thu' : 'Chi'} ${t.amount}đ nội dung "${t.description}" (${t.category})`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Phân tích dữ liệu tài chính sau đây và đưa ra 3 lời khuyên hoặc nhận xét ngắn gọn, súc tích bằng tiếng Việt về thói quen chi tiêu. Giọng văn thân thiện nhưng thực tế.
      
      Dữ liệu:
      ${simplifiedData}`,
      config: {
        systemInstruction: "Bạn là một trợ lý tài chính cá nhân thông minh. Trả về định dạng plain text với markdown."
      }
    });

    return response.text || "Hiện tại chưa thể tạo thông tin chi tiết.";
  } catch (error) {
    console.error("Error generating insights:", error);
    return "Đã xảy ra lỗi khi phân tích dữ liệu.";
  }
};
