# Notification System Design

## Stage 1

### What the problem is

Students on the campus platform get a lot of notifications and the important ones get buried. The fix is a Priority Inbox that pulls the top n notifications ranked by what matters most.

---

### How I ranked notifications

Each notification has a type — Placement, Result, or Event. I assigned numeric weights:

| Type | Weight |
|------|--------|
| Placement | 30 |
| Result | 20 |
| Event | 10 |

Within the same type, newer notifications rank higher. I combined both into one score:

```
score = weight * 10^10 + unix_timestamp
```

Multiplying the weight by a large number means type always dominates. A Placement from last week still beats a Result from today.

---

### Why a heap

Sorting all notifications every time is wasteful, especially as new notifications keep coming in. Instead I maintain a min-heap capped at size n:

- Push each notification (by score) into the heap
- If heap size goes past n, pop the smallest
- At the end the heap has exactly the top n

For each new notification that arrives, I just check if its score beats the current minimum. If yes, swap it in and pop the min. This keeps updates at O(log n) regardless of how many total notifications exist.

**Time:** O(m log n), where m is total notifications  
**Space:** O(n)

---

### Handling new notifications as they arrive

The heap stays at fixed size n. When a new notification comes in:
- Score it
- If it's higher than the heap's current minimum → push it, pop the old min
- Otherwise → skip it

This works in real time without re-sorting everything.

---

### Logging

I used Python's logging module wired to both a file (notifications.log) and stdout. Every fetch, ranking step, and error goes through the logger. No print statements used.

---

### Assumptions made

- Users are pre-authenticated, no login needed
- Notifications come from the API, no local storage or hardcoding
- n defaults to 10 but is easy to change in the code
- Read/unread state is handled in the frontend (Stage 2)

---

### Flow

```
GET /evaluation-service/notifications
        |
        v
score each notification
        |
        v
maintain min-heap of size n
        |
        v
sort heap descending
        |
        v
print ranked table

