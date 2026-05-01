import { NextResponse } from 'next/server';
import { superAdminAgent } from '@/agents/superAdminAgent';

export async function GET() {
  const result = await superAdminAgent.processAction('get_owners', {});
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await superAdminAgent.processAction('add_owner', body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
