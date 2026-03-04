# IS113 Web Application Development 1 Project
## G5 - Group 6

```
Meme Gallery / Voting Board
o Users upload memes (images or links)
o Everyone can upvote/downvote, most popular ones float to the top.
```

### Setup Instructions
hello

---
---

## STRUCTURE

### name

**login page**
- login validation
- link to registerartion page

**registration page, edit user info**
- create user account form
-- validate email not already used
-- min age based on dob
-- password/ reenter password - check equal
- edit
-- prefill all existing info, to edit

---

### name

**user page**
- show user info
- show all user's posts
- (if user is owner) show edit user button [go to edit user page]

- show posts, sort by post upload datetime
    etc (lowest, oldest, most/least comments, ...)

---

### name

**home page**
- show loggedin user , link to login page if not logged in
- upload post button (go to upload post page)
- highest
-- show posts, sort by vote score
- newest
-- show posts, sort by post upload datetime
- etc (lowest, oldest, most/least comments, ...)

---

### name

**upload / edit post page**
- upload
-- show blank upload form - title, image, decription
- edit (check user is post author)
-- prefill title, description - show image
-- allow edit title and description only

---

### name

**view post page**
display post
- add comment form
- show comments (sort by time, etc..)
- (if user is author of comment) - show edit comment button
-- change comment to form text area, prefill with current comment, allow edit, [save edit / cancel button]

---

## name

**post template**
-- title [click go to view post page]
-- image [click go to view post page]
-- description [click go to view post page]
-- post author (click go to user page)
-- post age (7h / 5m / 1h / 5d / 2m / 2y ago) - based on upload_datetime
-- vote score
-- upvote/downvote buttons (must only be able to select 1, selecting 1 deselects the other) [update vote score]
-- comment count [click go to view post page]
-- (if user is owner) show edit/delete post button [go to edit post page]

**comment template**
- (if user is author of comment) - show edit/delete comment button
-- change comment to form text area, prefill with current comment, allow edit, [save edit / cancel button]
- author name (click go to user page)
- comment text
- comment age (7h / 5m / 1h / 5d / 2m / 2y ago) - based on upload_datetime
- "edited" if edit_datetime is not null/undefined



=====================================================================


## DATABASE

**USER**
user_id (pk)
email (unique)
password (hash)
name
dob
bio
creation_datetime


**VOTE**
user_id
post_id
value (bool) true: upvote, false: downvote


**POST**
post_id (pk)
user_id (fk - USER.user_id) [author of the post]
title
description
image
vote_score (default 0)
comment_count
upload_datetime
edit_datetime


**COMMENT**
comment_id (pk)
post_id (fk - POST.post_id)
user_id (fk - USER.user_id) [author of the comment]
text
upload_datetime
edit_datetime

---

_Give us A+ pls_