import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export const maxDuration = 30; // Limit execution time to 30 seconds

export async function POST(req: NextRequest) {
  try {
    const { submittedText, guidelines } = await req.json();

    if (!submittedText || !submittedText.trim()) {
      return NextResponse.json(
        { isSuccess: false, errorMessage: 'Bài làm của học viên không được trống.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBfFLOSzZ5FY8yrggkHt5iGEH9lIVPJpK0';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Bạn là một trợ lý AI chấm điểm bài tập thực hành xuất sắc.
Hãy đánh giá bài nộp của học viên dựa trên đề bài / yêu cầu (guidelines) dưới đây.

YÊU CẦU ĐỀ BÀI (GUIDELINES):
${guidelines || 'Bài tập thực hành'}

BÀI LÀM CỦA HỌC VIÊN (SUBMISSION):
${submittedText}

YÊU CẦU ĐÁNH GIÁ:
- Cho điểm bài nộp từ 0 đến 100 điểm.
- Viết nhận xét (feedback) chi tiết bằng Tiếng Việt chỉ rõ ưu điểm, khuyết điểm, và cách cải thiện bài làm. Gợi ý thêm code hoặc ví dụ nếu cần.
- Xác định trạng thái đạt hay chưa đạt (isPassed = true nếu score >= 50, ngược lại isPassed = false).

Hãy trả về kết quả dưới định dạng JSON theo đúng schema quy định.`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            score: { type: SchemaType.INTEGER },
            feedback: { type: SchemaType.STRING },
            isPassed: { type: SchemaType.BOOLEAN }
          },
          required: ['score', 'feedback', 'isPassed']
        },
        maxOutputTokens: 2048
      }
    });

    const responseText = result.response.text().trim();
    const evaluation = JSON.parse(responseText);

    return NextResponse.json({
      isSuccess: true,
      result: evaluation
    });

  } catch (error: any) {
    console.error('AI grading error:', error);
    return NextResponse.json(
      { isSuccess: false, errorMessage: error.message || 'Lỗi khi chấm điểm bằng AI.' },
      { status: 500 }
    );
  }
}
