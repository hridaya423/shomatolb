export interface Post {
  "Created At": string;
  PlayLink: string;
  Attachements: Array<{
    url: string;
    type: string;
    filename: string;
    id: string;
    size: number;
  }>;
  "slack id": string;
  "Game Name": string;
  Content: string;
  PostID: string;
  GameThumbnail: string;
  Badges: string[];
  postType: string;
  timelapseVideoId: string;
  githubImageLink: string;
  timeScreenshotId: string;
  hoursSpent: number;
  minutesSpent: number;
  posterShomatoSeeds: number[];
}

export interface LeaderboardEntry {
  slackId: string;
  gameName: string;
  totalSeeds: number;
  gameLink: string;
  thumbnail?: string;
}