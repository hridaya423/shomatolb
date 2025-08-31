import { Post, LeaderboardEntry } from './types';

const API_URL = '/api/posts';
const CACHE_KEY = 'shomato_posts_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const UPDATE_INTERVAL = 10 * 60 * 1000; // 10 minutes

interface CacheData {
  posts: Post[];
  timestamp: number;
  lastFetch: number;
}

class PostsCache {
  private cache: CacheData | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadFromStorage();
    this.startPeriodicUpdates();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        this.cache = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load cache from localStorage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined' || !this.cache) return;
    
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Failed to save cache to localStorage:', error);
    }
  }

  private startPeriodicUpdates(): void {
    if (typeof window === 'undefined') return;
    
    this.updateInterval = setInterval(async () => {
      try {
        await this.backgroundUpdate();
      } catch (error) {
        console.error('Background update failed:', error);
      }
    }, UPDATE_INTERVAL);
  }

  private async backgroundUpdate(): Promise<void> {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const newPosts: Post[] = await response.json();
        this.mergePosts(newPosts);
      }
    } catch (error) {
      console.error('Background fetch failed:', error);
    }
  }

  private mergePosts(newPosts: Post[]): void {
    if (!this.cache) {
      this.cache = {
        posts: newPosts,
        timestamp: Date.now(),
        lastFetch: Date.now()
      };
    } else {
      const existingPostsMap = new Map(this.cache.posts.map(post => [post.PostID, post]));
      
      newPosts.forEach(newPost => {
        const existing = existingPostsMap.get(newPost.PostID);
        if (!existing || this.hasUpdatedSeeds(existing, newPost)) {
          existingPostsMap.set(newPost.PostID, newPost);
        }
      });

      this.cache = {
        posts: Array.from(existingPostsMap.values()),
        timestamp: Date.now(),
        lastFetch: Date.now()
      };
    }
    
    this.saveToStorage();
  }

  private hasUpdatedSeeds(oldPost: Post, newPost: Post): boolean {
    const oldSeeds = oldPost.posterShomatoSeeds?.reduce((sum, seed) => sum + seed, 0) || 0;
    const newSeeds = newPost.posterShomatoSeeds?.reduce((sum, seed) => sum + seed, 0) || 0;
    return newSeeds > oldSeeds;
  }

  shouldFetch(): boolean {
    if (!this.cache) return true;
    return Date.now() - this.cache.lastFetch > CACHE_DURATION;
  }

  get(): Post[] | null {
    return this.cache?.posts || null;
  }

  set(posts: Post[]): void {
    this.mergePosts(posts);
  }

  clear(): void {
    this.cache = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
    }
  }

  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

const cache = new PostsCache();

export async function fetchPosts(): Promise<Post[]> {
  const cachedPosts = cache.get();
  
  if (cachedPosts && !cache.shouldFetch()) {
    return cachedPosts;
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts: Post[] = await response.json();
    cache.set(posts);
    return cache.get() || posts;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    if (cachedPosts) {
      return cachedPosts;
    }
    throw error;
  }
}

export function generateLeaderboard(posts: Post[]): LeaderboardEntry[] {
  const userMap = new Map<string, LeaderboardEntry>();

  posts.forEach(post => {
    const slackId = post["slack id"];
    const gameName = post["Game Name"];
    const seeds = post.posterShomatoSeeds || [];
    const totalSeeds = seeds.reduce((sum, seed) => sum + seed, 0);

    if (slackId && gameName && totalSeeds > 0) {
      const existing = userMap.get(slackId);
      if (!existing || existing.totalSeeds < totalSeeds) {
        const gameLink = `https://shiba.hackclub.com/games/${slackId}/${encodeURIComponent(gameName)}`;
        const thumbnail = post.GameThumbnail || post.Attachements?.[0]?.url;
        
        userMap.set(slackId, {
          slackId,
          gameName,
          totalSeeds,
          gameLink,
          thumbnail
        });
      }
    }
  });

  return Array.from(userMap.values())
    .sort((a, b) => b.totalSeeds - a.totalSeeds);
}