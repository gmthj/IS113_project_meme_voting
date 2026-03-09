# IS113 Web Application Development 1 Project
## G5 - Group 6

Meme Gallery / Voting Board
- Users upload memes (images or links)
- Everyone can upvote/downvote, most popular ones float to the top.

---

## Setup Instructions

1. install [nodejs & npm](https://nodejs.org/en/download)
2. clone this repo

```bash
git clone https://github.com/gmthj/IS113_project_meme_voting
```

3. install node_modules and dependencies

```bash
npm i
```

4. Setup an account on [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database)
5. create mongodb database and copy the connection string
6. make a `.env` file (yes, literally named `.env`) in `IS113_project_meme_voting/` with the following

```
MONGO_URI=<connnection string>
SECRET=<some super long random string>
```
replace `<some super long random string>` with an actual long string of random characters <br>
replace `<connnection string>` with your actual connection string from MongoDB Atlas. it looks like this:

```
mongodb+srv://<db_username>:<db_password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

note: replace `<db_password>` with the password you created for the user in your mongodb database

7. initialise database with sample data

```bash
npm run init-db
```

8. run the app

```bash
npm run start
# or
npm run nodemon
```


---

## STRUCTURE

### zhiyu

**login page**

- login validation
- link to registerartion page

**registration page, edit user info**

- create user account form
  - validate email not already used
  - min age based on dob
  - password/ reenter password - check equal
- edit
  - prefill all existing info, to edit

---

### kinyu

**user page**

- show user info
- (if user is owner) show edit user button [go to edit user page]
- show all user's posts
  - sort by post upload datetime
    etc (lowest, oldest, most/least comments, ...)
- show all user's comments (maybe idk uty)

---

### rae

**home page**

- show loggedin user , link to login page if not logged in
- upload post button (go to upload post page)
- highest
  - show posts, sort by vote score
- newest
  - show posts, sort by post upload datetime
- etc (lowest, oldest, most/least comments, ...)

---

### xinlei

**upload / edit post page**

- upload
  - show blank upload form - title, image, decription
- edit (check user is post author)
  - prefill title, description - show image
  - allow edit title and description only

---

### george

**view post page**

- display post
- add comment form
- show comments (sort by time, etc..)

---

## gabriel

**post template**

- title [click go to view post page]
- image [click go to view post page]
- description [click go to view post page]
- post author (click go to user page)
- post age (7h / 5m / 1h / 5d / 2m / 2y ago) - based on upload_datetime
- vote score
- upvote/downvote buttons (must only be able to select 1, selecting 1 deselects the other) [update vote score]
- comment count [click go to view post page]
- (if user is owner) show edit/delete post button [go to edit post page]

**comment template**

- (if user is author of comment) - show edit/delete comment button
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

## File Structure

---

**models/**  
Contains all Mongoose schemas (database models).

| Model      | Collection | Purpose                      |
| ---------- | ---------- | ---------------------------- |
| User.js    | users      | Stores user accounts         |
| Post.js    | posts      | Stores meme posts            |
| Comment.js | comments   | Stores comments on posts     |
| Vote.js    | votes      | Stores upvotes and downvotes |

### Example Relationships

- `users._id → posts.userId`
- `users._id → comments.userId`
- `posts._id → comments.postId`
- `posts._id → votes.postId`
- `users._id → votes.userId`

**services/**  
Contains reusable database helper functions.  
This prevents database logic from being duplicated across scripts and routes.

| File           | Function              | Purpose                        |
| -------------- | --------------------- | ------------------------------ |
| userService.js | getUserByEmail(email) | Finds a user using their email |
| postService.js | getPostByTitle(title) | Finds a post using its title   |

These helpers can be used in scripts, routes, or controllers.

### Example Usage

```javascript
const { getUserByEmail } = require("../services/userService");

const user = await getUserByEmail("seed@smu.edu.sg");
```
