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
| Email                   | Password             | DoB (for forgot pw) |
| ----------------------- | -------------------- | ------------------- |
| lkshar@smu.edu.sg       | Pass1234!            | 23/03/2000          |
| alex.tan@smu.edu.sg     | Alexl0ve5Mei!        | 09/11/2004          |
| priya.nair@smu.edu.sg   | P0oO0o109k$          | 14/11/2000          |
| jordan.lim@smu.edu.sg   | Pasdvsds1534!        | 09/11/2005          |
| mei.chen@gmail.com      | #iubPu#po            | 17/01/2002          |
| ravi.s@smu.edu.sg       | Pas676767!           | 17/01/2002          |
| sophie.wu@smu.edu.sg    | HelloPass109#        | 17/01/2002          |

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
| File(s)       | Usage Level            | Explanation |
|---------------|----------------------|-----------|
| /public/css/style.css    | Full       | -                 |
| /views/XXX.ejs        | Partial     | ONLY used for the css styling |
| /public/img/daily-dank-logo.png <br> /public/img/daily-dank.png <br> /public/img/icon.png | Partial | Mostly generated logo images, some post editing |
| /views/partials/backToTop.ejs | Full | just a non-critial frontend / UX feature nothing important |
| sample data | Partial | some data was ai generated, the rest is active usage by members |


_Give us A+ pls_
