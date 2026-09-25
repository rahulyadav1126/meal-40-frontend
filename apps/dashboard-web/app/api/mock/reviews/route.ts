import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ message: 'Mock reviews are retired. Use the authenticated reviews API.' }, { status: 410 });
}
export const POST = GET;
