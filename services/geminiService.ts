
import { GoogleGenAI } from "@google/genai";
import { Candidate } from "../types";

export const getElectionAnalysis = async (candidates: Candidate[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const candidateSummary = candidates.map(c => 
    `- ${c.name}: ${c.bio}`
  ).join("\n");

  const prompt = `
    Dưới đây là danh sách các ứng cử viên đang được bầu chọn vào Ban Điều Hành Giáo Lý Thiếu Nhi:
    ${candidateSummary}

    Hãy viết một đoạn nhận định ngắn gọn (3-4 câu) về tầm quan trọng của sự dấn thân phục vụ trong Ban Giáo Lý.
    Phân tích nhẹ nhàng về sự đa dạng của các ứng viên và đưa ra lời động viên cho cộng đoàn khi lựa chọn những người gánh vác trách nhiệm.
    Trả về định dạng Markdown, ngôn ngữ trang trọng nhưng gần gũi.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Không thể tải phân tích từ AI lúc này. Vui lòng thử lại sau.";
  }
};
