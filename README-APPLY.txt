CHAPTER GATING, OFFLINE RULES, COVERS, CLEAR ON LOGOUT
======================================================

1. SCHEMA (manual)
   Follow prisma/SCHEMA-ADDITIONS.txt. Three additions, then:

     npx prisma validate
     npx prisma generate
     npm run prisma:migrate      (name it: add_chapter_unlocks)

2. UNZIP
   From the project folder:

     unzip -o chapter-gating-changes.zip

   Files added or replaced:
     src/lib/unlockPayments.ts                                       (new)
     src/lib/clearLocalData.ts                                       (new)
     src/lib/offlineStore.ts                                         (replaced)
     src/app/api/chapters/[id]/unlock/route.ts                       (new)
     src/app/api/unlocks/callback/route.ts                           (new)
     src/app/api/tips/webhook/route.ts                               (replaced)
     src/app/api/books/[id]/offline/route.ts                         (replaced)
     src/app/books/[id]/chapters/[chapterId]/page.tsx                (replaced)
     src/components/UnlockChapterButton.tsx                          (new)
     src/components/DownloadBookButton.tsx                           (replaced)
     src/components/OfflineLibrary.tsx                               (replaced)
     src/components/LogoutButton.tsx                                 (replaced)

3. CLEAR OLD DOWNLOADS ON EVERY DEVICE
   Downloads made before this change may hold chapter text for priced chapters.
   On each device, open Library and tap "Clear all downloads", then download again.

4. TEST
   a. Open a priced chapter as a reader who hasn't paid. You should see a
      preview of about 120 words, the price, and an Unlock button. View the
      page source: the rest of the text must not be there.
   b. Log out. Log in as another account, open a book, and download it.
      Locked chapters show a lock and "Unlock it online to read it".
   c. Unlock a chapter with a test card. You return to the chapter with the
      text shown and a "Chapter unlocked" message. The author's wallet shows
      the earning.
   d. Log out. The Library should be empty, and the cached pages cleared.
   e. Covers should show in the Library with no connection.

5. WEBHOOK
   The existing Paystack webhook URL handles unlocks too. No change in the
   dashboard is needed.

6. PUSH
   git add .
   git commit -m "Chapter gating: paid unlocks, offline access rules, saved covers, clear on logout"
   git push

KNOWN LIMIT
-----------
If a reader starts checkout twice for the same chapter, the second attempt
replaces the first. If they pay through the first checkout page, the admin
Tips reconcile page can't see it yet. This is rare; tell me if you see it.
