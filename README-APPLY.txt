ADMIN TAKEDOWNS: REASONS, AUTHOR NOTICE, PAID-CONTENT GUARD
==========================================================

1. SCHEMA (manual)
   Follow prisma/SCHEMA-ADDITIONS.txt: add CONTENT_REMOVED to the
   NotificationType enum, then:

     npx prisma validate
     npx prisma generate
     npx prisma migrate deploy
     npx prisma migrate status

2. UNZIP
   From the project folder:

     unzip -o content-moderation-changes.zip

   Files added or replaced:
     prisma/migrations/20261117100000_notify_content_removed/migration.sql  (new)
     src/lib/notify.ts                                                     (replaced)
     src/app/api/admin/content/route.ts                                    (replaced)
     src/components/ContentModeration.tsx                                  (replaced)

3. TEST
   a. Remove a post. Enter a reason under 5 characters: it is refused.
      Enter a valid reason: the post goes, and the author's bell shows
      "Your post was removed by StorySpace. Reason: ...".
   b. Remove a book with no paid chapters: it goes, and the author is notified.
   c. Remove a book with a paid chapter: the admin sees the paid-content
      message. Pressing Cancel changes nothing. Only after refunding in Paystack
      and pressing OK does the book go.

4. PUSH
   git add .
   git commit -m "Admin takedowns: required reason, author notice, paid-content guard"
   git push

BEFORE YOU USE IT ON REAL CONTENT
---------------------------------
- Removal is permanent. The app keeps no copy.
- Refunds are not automatic. Issue them in Paystack before forcing removal.
- Every removal is logged in the server logs with the reason, so keep the
  reason specific enough to make sense later.
