APPLYING THE DESIGN CHANGES
===========================

1. SCHEMA (manual - do this first)
   Open prisma/SCHEMA-ADDITIONS.txt and paste the snippets into
   prisma/schema.prisma. Do NOT replace the whole schema file.
   Then run:

     npx prisma validate
     npx prisma generate
     npm run prisma:migrate     (name: add_book_views)
     npm run prisma:migrate     (name: add_editor_picks)

2. UNZIP
   From the project folder:

     unzip -o storyspace-design-changes.zip

   This adds new files and replaces the files listed below. Nothing else
   is touched.

3. DELETE (not needed any more)
   - src/components/AdSlot.tsx
   - Any leftover src/components/NewBookForm.tsx or NewChapterForm.tsx
     are harmless and can be deleted if you no longer use them.

4. PHOTOS (manual)
   Save the eight hero photos into public/hero/ as 1.jpg through 8.jpg.

5. TEST ON LOCALHOST
   - Signed out: the landing page is fully dark, including the header.
     The header has no theme toggle.
   - Signed in as a reader: open a book, refresh, and the Popular row
     shows one read (not two). Your own book does not count.
   - Log in as the admin: open Admin, click "Editor picks", search a
     book title, press Add. It appears in "Top picks by editors" on the
     homepage.
   - The banner shows book slides and two "Advertisement" slides. The
     arrows move through all of them.

6. PUSH
   git add .
   git commit -m "Design changes: banner with house ads, editor picks, view tracking, dark landing"
   git push

FILES IN THIS PACKAGE
---------------------
src/lib/ads.ts
src/components/FeaturedBanner.tsx
src/components/ViewTracker.tsx
src/components/EditorPicksManager.tsx
src/components/ShelfRow.tsx
src/components/BookCard.tsx
src/components/MarketingHero.tsx
src/components/LoginPanel.tsx
src/components/Header.tsx
src/app/page.tsx
src/app/books/[id]/page.tsx
src/app/books/[id]/view/route.ts   (inside src/app/api/books/[id]/view/)
src/app/api/admin/editor-picks/route.ts
src/app/api/admin/books/route.ts
src/app/admin/page.tsx
src/app/admin/editor-picks/page.tsx
