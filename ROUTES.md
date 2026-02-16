# Project Routes

This document lists the frontend and backend routes used in this project.

## Frontend Routes (Angular)

| Path | Component | Access |
|---|---|---|
| `/` | redirect to `/home` | Public redirect |
| `/login` | `Login` | Public |
| `/register` | `Register` | Public |
| `/home` | `Home` | Auth required (`authGuard`) |
| `/post/:id` | `PostDetailComponent` | Auth required (`authGuard`) |
| `/profile/:id` | `UserProfileComponent` | Auth required (`authGuard`) |
| `/subscriptions` | `SubscriptionsPageComponent` | Auth required (`authGuard`) |
| `/discover` | `DiscoverUsers` | Auth required (`authGuard`) |
| `/notifications` | `NotificationsComponent` | Auth required (`authGuard`) |
| `/admin` | `AdminDashboardComponent` | Admin required (`adminGuard`) |
| `**` | redirect to `/home` | Fallback |

---

## Backend Routes (Spring Boot)

### Public endpoints

| Method | Route | Notes |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/media/{fileName}` | Serve media |
| POST | `/api/media/upload/{postId}` | Upload media |

### Authenticated endpoints (JWT required)

| Method | Route | Notes |
|---|---|---|
| GET | `/api/users/me` | Current user |
| GET | `/api/users/id/{userId}` | User by id |
| GET | `/api/users` | All users |
| POST | `/api/posts` | Create post |
| PUT | `/api/posts/{id}` | Update post |
| DELETE | `/api/posts/{id}` | Delete post |
| GET | `/api/posts/{id}` | Get post by id |
| GET | `/api/posts` | Feed (paged) |
| GET | `/api/posts/user/{userId}` | Posts by user |
| POST | `/api/posts/{postId}/comments` | Create comment |
| GET | `/api/posts/{postId}/comments` | Post comments |
| GET | `/api/comments/user/{userId}` | User comments |
| PUT | `/api/posts/{postId}/comments/{commentId}` | Update comment |
| DELETE | `/api/posts/{postId}/comments/{commentId}` | Delete comment |
| POST | `/api/posts/{postId}/likes` | Toggle like |
| GET | `/api/posts/{postId}/likes/status` | Like status/count |
| GET | `/api/notifications` | User notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| PUT | `/api/notifications/{notificationId}/read` | Mark one as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| POST | `/api/subscriptions/{userId}` | Toggle subscribe |
| GET | `/api/subscriptions/{userId}/status` | Subscription status |
| GET | `/api/subscriptions/{userId}/subscriptions` | Following list |
| GET | `/api/subscriptions/{userId}/subscribers` | Followers list |
| POST | `/api/reports` | Create report |
| GET | `/api/reports/my-reports` | My reports |

### Admin endpoints (ROLE_ADMIN required)

| Method | Route | Notes |
|---|---|---|
| GET | `/api/admin/users` | List users |
| POST | `/api/admin/users/{userId}/ban` | Ban user |
| POST | `/api/admin/users/{userId}/unban` | Unban user |
| DELETE | `/api/admin/users/{userId}` | Delete user |
| GET | `/api/admin/posts` | List posts |
| DELETE | `/api/admin/posts/{postId}` | Delete post |
| POST | `/api/admin/posts/{postId}/hide` | Hide post |
| POST | `/api/admin/posts/{postId}/unhide` | Unhide post |
| GET | `/api/admin/reports/pending` | Pending reports |
| GET | `/api/admin/reports` | All reports |
| POST | `/api/admin/reports/{reportId}/resolve` | Resolve report |
| POST | `/api/admin/reports/{reportId}/dismiss` | Dismiss report |
| GET | `/api/admin/analytics` | Dashboard metrics |

---

## Security rules summary

- Public: `/api/auth/login`, `/api/auth/register`, `/api/media/**`
- Admin-only: `/api/admin/**`
- Everything else: authenticated
