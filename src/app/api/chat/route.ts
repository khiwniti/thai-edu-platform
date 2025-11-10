import { NextRequest, NextResponse } from 'next/server';
import { createCopilotClient } from '@/lib/copilotApi';

export async function POST(request: NextRequest) {
  try {
    const { messages, stream = true } = await request.json();

    const copilot = createCopilotClient();
    
    if (!copilot) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    if (stream) {
      const encoder = new TextEncoder();
      
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            const responseStream = await copilot.chat(messages, true) as AsyncIterable<string>;
            
            for await (const chunk of responseStream) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
            }
            
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            controller.error(error);
          }
        }
      });

      return new NextResponse(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } else {
      const response = await copilot.chat(messages, false) as string;
      
      return NextResponse.json({ content: response });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
