import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided.' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF documents are allowed.' },
        { status: 400 }
      );
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfData = await pdfParse(buffer);

    if (!pdfData.text || pdfData.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. The document might be image-based or protected.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text: pdfData.text.trim(),
      pageCount: pdfData.numpages || 1,
    });

  } catch (error) {
    console.error('[/api/parse-pdf]', error);
    return NextResponse.json(
      { error: 'Failed to process PDF document.' },
      { status: 500 }
    );
  }
}
