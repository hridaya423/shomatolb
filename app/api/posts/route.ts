import { NextResponse } from 'next/server';
import { Post } from '@/lib/types';

const API_URL = 'https://shiba.hackclub.com/api/GetAllPosts';

export async function GET() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'User-Agent': 'ShomatoLeaderboard/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts: Post[] = await response.json();
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}