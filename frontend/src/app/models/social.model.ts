export interface LikeResponse {
  id: string;
  userId: string;
  username: string;
  postId: string;
  createdAt: string;
}

export interface LikeStatusResponse {
  liked: boolean;
  likeCount: number;
  like?: LikeResponse;
}

export interface CommentRequest {
  content: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  userId: string;
  username: string;
  userAvatar: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionResponse {
  id: string;
  subscriberId: string;
  subscriberUsername: string;
  subscribedToId: string;
  subscribedToUsername: string;
  subscribedToAvatar: string;
  createdAt: string;
}

export interface SubscriptionStatusResponse {
  subscribed: boolean;
  subscriberCount: number;
  subscriptionCount: number;
  subscription?: SubscriptionResponse;
}

export interface NotificationResponse {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'SUBSCRIPTION' | 'MENTION' | 'POST';
  message: string;
  referenceId: string;
  isRead: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
