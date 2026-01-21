export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  status: string;
  owner: UserSummary;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  status: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  status?: string;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  status?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
