import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Store the reviews in the root of the frontend workspace
const DB_PATH = path.join(process.cwd(), '../../mock-reviews.json');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function getReviews() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading mock DB', e);
  }
  return [];
}

function saveReviews(reviews: any[]) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(reviews, null, 2));
  } catch (e) {
    console.error('Error writing mock DB', e);
  }
}

export async function GET() {
  return NextResponse.json({ data: getReviews() }, { headers: CORS_HEADERS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reviews = getReviews();
    
    const newReview = {
      id: Math.floor(Math.random() * 1000000),
      createdAt: new Date().toISOString(),
      customer: { id: 1, name: 'You', email: 'you@example.com' },
      ...body
    };
    
    reviews.unshift(newReview);
    saveReviews(reviews);
    
    return NextResponse.json({ data: newReview }, { headers: CORS_HEADERS });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}
