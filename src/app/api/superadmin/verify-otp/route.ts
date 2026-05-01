import { NextResponse } from 'next/server';
import { authAgent } from '@/agents/authAgent';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await authAgent.processAction('verify_otp', body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
