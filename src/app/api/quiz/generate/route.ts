import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import * as pdf from 'pdf-parse';

export const maxDuration = 60; // Allow longer execution time for PDF processing

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const courseTitle = formData.get('courseTitle') as string || 'Khóa học';
    const numQuestionsVal = formData.get('numQuestions') as string;
    const numQuestions = numQuestionsVal ? parseInt(numQuestionsVal, 10) : 5;

    if (!file) {
      return NextResponse.json(
        { isSuccess: false, errorMessage: 'Không tìm thấy file tải lên.' },
        { status: 400 }
      );
    }

    // 1. Parse PDF/Txt text content
    let textContent = '';
    if (file.type === 'text/plain') {
      textContent = await file.text();
    } else if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const parser = typeof pdf === 'function' ? pdf : (pdf as any).default;
      const parsed = await parser(buffer);
      textContent = parsed.text;
    } else {
      return NextResponse.json(
        { isSuccess: false, errorMessage: 'Định dạng file không hỗ trợ. Vui lòng chọn file PDF hoặc TXT.' },
        { status: 400 }
      );
    }

    if (!textContent || textContent.trim().length < 50) {
      return NextResponse.json(
        { isSuccess: false, errorMessage: 'Không thể trích xuất văn bản từ tệp này hoặc nội dung quá ngắn.' },
        { status: 400 }
      );
    }

    // 2. Call Gemini
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCTIkWsU6y4sjlRGs0g-lrJnL427pn8fR4';
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-2.5-flash which is fast and supports JSON responseSchema
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Bạn là một chuyên gia và giảng viên xuất sắc về chủ đề: "${courseTitle}".
Hãy đọc kỹ tài liệu văn bản dưới đây và tạo ra đúng ${numQuestions} câu hỏi trắc nghiệm khách quan để kiểm tra kiến thức của học viên.

YÊU CẦU ĐỀ THI:
- Đảm bảo câu hỏi có tính học thuật cao, chính xác và bao quát đều các nội dung quan trọng trong tài liệu.
- Mỗi câu hỏi PHẢI có đúng 4 phương án lựa chọn.
- Các phương án phải bắt đầu bằng chữ cái và dấu chấm (ví dụ: "A. Định nghĩa", "B. Khái niệm", ...).
- Câu hỏi và phương án phải ngắn gọn, súc tích.

YÊU CẦU ĐỊNH DẠNG JSON (QUAN TRỌNG):
- Trường "answer" PHẢI là đúng 1 chữ cái in hoa đại diện cho phương án đúng: "A", "B", "C", hoặc "D" (TUYỆT ĐỐI KHÔNG được ghi nội dung câu trả lời hoặc chữ thường vào trường này).
- TUYỆT ĐỐI KHÔNG được sử dụng dấu ngoặc kép kép (") ở bên trong nội dung của câu hỏi hoặc nội dung các phương án. Nếu cần trích dẫn cụm từ hoặc câu nói, hãy dùng dấu ngoặc đơn (') thay thế để không làm hỏng cấu trúc JSON.

TÀI LIỆU VĂN BẢN:
${textContent.substring(0, 30000)}
`;

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
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              question: { type: SchemaType.STRING },
              options: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING }
              },
              answer: { type: SchemaType.STRING }
            },
            required: ['question', 'options', 'answer']
          }
        },
        maxOutputTokens: 8192
      }
    });

    const responseText = result.response.text().trim();
    const questions = JSON.parse(responseText);

    return NextResponse.json({
      isSuccess: true,
      result: questions
    });

  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { isSuccess: false, errorMessage: error.message || 'Lỗi hệ thống khi sinh đề thi.' },
      { status: 500 }
    );
  }
}
