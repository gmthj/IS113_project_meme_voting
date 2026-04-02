# IS113 Web Application Development 1 Project : THE DAILY DANK
## G5 - Group 6

Meme Gallery / Voting Board
- Users upload memes (images or links)
- Everyone can upvote/downvote, most popular ones float to the top.

---

## Setup Instructions

1. Install [nodejs & npm](https://nodejs.org/en/download)

2. Download and unzip the `IS113_project_meme_voting.zip` file

3. Navigate to the `/IS113_project_meme_voting` folder
```bash
cd IS113_project_meme_voting
```

4. Install dependencies
```bash
npm install
```

5. Start the application
```bash
npm start
```

6. Open your browser <br>
http://localhost:8000/

> host name and port number can be found in `config.js` if you wish to use a different port number

---

## Sample Data Login Credentials
| Email                   | Password             |
| ----------------------- | -------------------- |
| lkshar@smu.edu.sg       | Pass1234!            |
| alex.tan@smu.edu.sg     | Alexl0ve5Mei!        |
| priya.nair@smu.edu.sg   | P0oO0o109k$          |
| jordan.lim@smu.edu.sg   | Pasdvsds1534!        |
| mei.chen@gmail.com      | #iubPu#po            |
| ravi.s@smu.edu.sg       | Pas676767!           |
| sophie.wu@smu.edu.sg    | HelloPass109#        |

## Karma Based Voting (Complex Logic)

The Karma system rewards users who submit good content. A user's `totalKarma` determines their Karma Tier, which in turn determines the *weight* of their votes

### Voting Logic
When a user votes on a post or comment, the following calculations occur:

- **Entity Score (`vote_score`)**: The score of the post or comment changes by:
  `Vote Direction (+1 or -1) * Voter's Tier Weight`
- **Author's Karma (`totalKarma`)**: The author of the post or comment receives a karma change of:
  `Vote Direction (+1 or -1) * Voter's Tier Weight * Entity Weight`
  > Note: A user cannot gain or lose `totalKarma` by self-voting on their own posts or comments
  > Deleting a post/comment does not affect `totalKarma` i.e. a user should not be able to delete a heavily downvoted post/comment to improve their karma

### Entity Weights
| Entity    | Weight |
| --------- |------- |
| Post      | 2      |
| Comment   | 1      |

### Karma Tiers & Voter Weights

| Tier           | Voter Weight | Condition                                    |
|----------------|--------------|----------------------------------------------|
| **Troller**    |  0           | `totalKarma < KARMA_TIER_0` (default: -5)    |
| **Newcomer**   |  1           | Account age < `KARMA_NEW` days (default: 30) |
| **Lurker**     |  1           | `totalKarma < KARMA_TIER_1` (default: 10)    |
| **Apprentice** |  2           | `totalKarma < KARMA_TIER_2` (default: 50)    |
| **Master**     |  3           | `totalKarma < KARMA_TIER_3` (default: 100)   |
| **Legend**     |  5           | `KARMA_TIER_3 <= totalKarma`                 |
| **Unknown**    |  1           |  -                                           |

> All weights can be found and adjusted in `config.js`

## DATABASE

**USER**
- email: String (unique)
- passwordHash: String
- name: String
- dob: Date
- bio: String
- avatar: String
- totalKarma: Number (default: 0)

**VOTE**
- userId: ObjectId
- postId: ObjectId
- commentId: ObjectId
- value: Boolean (true: upvote, false: downvote)

**POST**
- userId: ObjectId (author of the post)
- title: String
- description: String
- image: String (base64) (deprecated/fallback)
- imageId: ObjectId
- vote_score: Number (default: 0)
- comment_count: Number (default: 0)
- upload_datetime: Date (default: now)
- edit_datetime: Date

**COMMENT**
- postId: ObjectId
- userId: ObjectId (author of the comment)
- text: String
- vote_score: Number (default: 0)
- upload_datetime: Date (default: now)
- edit_datetime: Date

**BOOKMARK**
- postId: ObjectId
- userId: ObjectId

**POST PREFERENCE** (sorting)
- userId: ObjectId
- page: String (home, user)
- sortType: String (newest, oldest, **highest-votes**, lowest-votes, most-comments, least-comments, bookmarks)

**COMMENT PREFERENCE** (sorting)
- userId: ObjectId
- commentId: ObjectId
- sortType: String (**newest**, oldest, highest-votes, lowest-votes)

**IMAGE**
- data: Buffer
- mimeType: String
- sizeBytes: Number

##  AI/LLM Usage Declaration
| File(s)       | Usage Level           | Explanation |
|---------------|----------------------|-----------|
| /public/css/style.css    | Full    | -                 |
| /views/XXX.ejs        | Partial     | ONLY used for the css styling |
| /public/img/daily-dank-logo.png <br> /public/img/daily-dank.png <br> /public/img/icon.png | Partial | Mostly generated logo images, some post editing |
| /views/partials/backToTop.ejs | Full | just a non-critial frontend / UX feature nothing important |
| add ai declaration here | - | - |



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
  - Bookmarks
- READ
  - User (user info)
  - Post (user's posts)
  - Comment (user's comments) NOT DONE!
- UPDATE
  - Update the user's sorting preference (for user page)
- DELETE
  - Bookmarks

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
  - sortPreference
- READ
  - Post (all posts) and sortPreference (else default)
- UPDATE
  - sortPreference
- DELETE
  - sortPreference

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


_Give us A+ pls_