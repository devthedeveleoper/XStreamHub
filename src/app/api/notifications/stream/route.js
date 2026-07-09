import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import eventEmitter from '@/lib/eventEmitter';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();
            
            // Send initial connection success
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

            const listener = (notification) => {
                // Only send to the specific user
                if (notification.recipient.toString() === userId) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(notification)}\n\n`));
                }
            };

            eventEmitter.on('newNotification', listener);

            // Keep connection alive with heartbeat every 30s
            const interval = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(`:\n\n`)); // SSE comment
                } catch (e) {
                    // Controller might be closed
                    clearInterval(interval);
                }
            }, 30000);

            request.signal.addEventListener('abort', () => {
                eventEmitter.off('newNotification', listener);
                clearInterval(interval);
                try {
                    controller.close();
                } catch (e) {
                    // Ignore close error if already closed
                }
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
