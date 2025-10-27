import { NextResponse } from 'next/server'

export const revalidate = 0 // No caching for health check

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
    { status: 200 }
  )
}
