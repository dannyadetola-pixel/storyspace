DEMO CONTENT: 14 BOOKS, 3 TO 6 CHAPTERS EACH
============================================

1. UNZIP
   From the project folder:

     unzip -o demo-content.zip

   Files added or replaced:
     scripts/demo-data.mjs     (new: the stories, creators, readers and posts)
     scripts/seed-demo.mjs     (replaced: reads demo-data.mjs)

2. CHECK NODE
     node -v        (must be 20.6 or newer)

3. REMOVE THE OLD DEMO FIRST (optional, the script does it anyway)
     node --env-file=.env scripts/seed-demo.mjs --clean

4. ADD THE NEW DEMO
     node --env-file=.env scripts/seed-demo.mjs

   It prints how many accounts, books, chapters and posts it created.

5. CHECK THE HOMEPAGE
   - Banner: the first books and two "Advertisement" slides.
   - Popular right now: the most-read book first, then descending.
   - Top picks by editors: the first four books.
   - New books: the most recently added book first.
   - New chapters: recent chapters from several different books.
   - From the feed: eight photos, most recent first.

6. CHECK THE BOOKS
   Open a book. Its first two chapters are free; the rest show the preview
   and the Unlock button. The author has no payout account, so the button
   says the author isn't set up to receive payments.

7. LOGIN
   Any demo account: demo_reader1@demo.storyspace.local / demo-password-123

8. REMOVE BEFORE REAL USERS ARRIVE
     node --env-file=.env scripts/seed-demo.mjs --clean

WARNING
-------
.env points at the live database. The demo content goes live on the real site.
Use --clean to remove it before launch.
