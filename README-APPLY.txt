AUTHOR NOTIFICATION ON CHAPTER UNLOCK
=====================================

1. SCHEMA (manual)
   Follow prisma/SCHEMA-ADDITIONS.txt: add CHAPTER_UNLOCKED to the
   NotificationType enum. The matching migration is included in this package.

2. UNZIP
   From the project folder:

     unzip -o unlock-notify-changes.zip

   Files added or replaced:
     prisma/migrations/20261116100000_notify_chapter_unlocked/migration.sql  (new)
     src/lib/notify.ts                                                        (replaced)
     src/lib/unlockPayments.ts                                                (replaced)

3. APPLY THE MIGRATION (use deploy, not prisma:migrate)

     npx prisma validate
     npx prisma generate
     npx prisma migrate deploy
     npx prisma migrate status

   The status should report the database as up to date.

4. TEST
   a. Sign in as a second reader and unlock a priced chapter.
   b. Sign in as the author. Within about five seconds the bell shows the
      green dot and the pop-up: "<reader> unlocked "<chapter>" in <book>".
   c. Tapping the notification opens the chapter.
   d. Unlock the same chapter again from the reader's account. It's blocked
      ("already unlocked"), so the author gets no second notification.

5. PUSH
   git add .
   git commit -m "Notify authors when a reader unlocks a chapter"
   git push
