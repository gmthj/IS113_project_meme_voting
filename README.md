# IS113 Web Application Development 1 Project
## G5 - Group 6

Meme Gallery / Voting Board
- Users upload memes (images or links)
- Everyone can upvote/downvote, most popular ones float to the top.

---

## Setup Instructions

1. Install [nodejs & npm](https://nodejs.org/en/download)
2. Clone this repository

```bash
git clone https://github.com/gmthj/IS113_project_meme_voting
cd IS113_project_meme_voting
```

3. Install dependencies

```bash
npm i
```

4. Setup an account on [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database)
5. Create MongoDB database and copy the connection string
6. Make a `.env` file (yes, literally named `.env`) in `IS113_project_meme_voting/` with the following

```bash
SECRET=<some super long random string>
MONGO_URI=<connnection string>
```
replace `<some super long random string>` with an actual long string of random characters <br>
replace `<connnection string>` with your actual connection string from MongoDB Atlas. It should look something like this:

```bash
mongodb+srv://<db_username>:<db_password>@cluster0.xxxx.mongodb.net/<db_name>?retryWrites=true&w=majority&appName=Cluster0
```

note: replace `<db_password>` with the password you created for the user in your mongodb database

7. Initialise database with sample data (optional)

```bash
npm run init-db
```

8. Start the application

```bash
npm run start
# or
npm run nodemon
```

9. Open your browser <br>
http://localhost:8000

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
- delete
  - delete User and all their comments and posts
 

**CRUD features**
- CREATE
  - User (register)
- READ
  - User (register/login, edit user info, delete user account)
  - Comment (delete user account)
  - Post (delete user account)
- UPDATE
  - User (edit user info)
- DELETE
  - User (delete user account)
  - Comment (delete user account)
  - Post (delete user account)

---

### kinyu

**user page**

- show user info
- (if user is owner) show edit user button [go to edit user page]
- show all user's posts
  - sort by post upload datetime
    etc (lowest, oldest, most/least comments, ...)
- show all user's comments
 

**CRUD features**
- CREATE
  - hello
- READ
  - User (user info)
  - Post (user's posts)
  - Comment (user's comments)
- UPDATE
  - hello
- DELETE
  - hello

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
 

**CRUD features**
- CREATE
  - hello
- READ
  - Post (all posts)
- UPDATE
  - hello
- DELETE
  - hello

---

### xinlei

**upload / edit post page**

- upload
  - show blank upload form - title, image, decription
- edit (check user is post author)
  - prefill title, description - show image
  - allow edit title and description only
- delete post
 

**CRUD features**
- CREATE
  - Post (upload new post)
- READ
  - Post (edit post, delete post)
- UPDATE
  - Post (edit post)
- DELETE
  - Post (delete post)

---

### george

**view post page**

- display post
- add comment form
- show comments (sort by time, etc..)
- delete comment
 
**CRUD features**
- CREATE
  - Comment (add new comment)
- READ
  - Post (show full post)
  - Comment (show post's comments, edit comment, delete comment)
- UPDATE
  - Comment (edit comment)
- DELETE
  - Comment (delete comment)

---

## gabriel

**post template**

[click go to view fullpost page]
- title, image, description, vote score, comment count
- post age - based on upload_datetime
- post author name/image (click go to user page)
- upvote/downvote buttons
- (if sessionUser is post author) show edit/delete post button [go to edit/delete post page]

**comment template**

- (if sessionUser is comment author) show edit/delete comment button [go to edit/delete comment page]
- author name/image (click go to user page)
- comment text
- comment age - based on upload_datetime
- "edited" / "author"
 

**CRUD features**
- CREATE
  - Vote (new upvote/downvote)
- READ
  - Vote (post template)
- UPDATE
  - Vote (switch vote - upvote -> downvote / downvote -> upvote)
- DELETE
  - Vote (remove - upvote/downvote -> no vote)

=====================================================================

## DATABASE

**USER**
- email: String (unique)
- passwordHash: String
- name: String
- dob: Date
- bio: String
- avatar: String

**VOTE**
- postId: [ObjectId]
- userId: [ObjectId]
- value: Boolean (true: upvote, false: downvote)

**POST**
- userId: [ObjectId] (author of the post)
- title: String
- description: String
- image: String (URL or base64)
- vote_score: Number (default: 0)
- comment_count: Number (default: 0)
- upload_datetime: Date (default: now)
- edit_datetime: Date

**COMMENT**
- postId: [ObjectId]
- userId: [ObjectId] (author of the comment)
- text: String
- upload_datetime: Date (default: now)
- edit_datetime: Date

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
