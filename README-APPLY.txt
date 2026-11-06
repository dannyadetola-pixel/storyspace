EXPLORE PAGE - APPLYING THE CHANGES
===================================

1. SCHEMA (manual)
   Paste the two snippets from prisma/SCHEMA-ADDITIONS.txt into
   prisma/schema.prisma. Do not replace the whole file.
   Then run:

     npx prisma validate
     npx prisma generate
     npm run prisma:migrate      (name it: add_recent_searches)

2. UNZIP
   From the project folder:

     unzip -o explore-changes.zip

   Files added or replaced:
     src/app/explore/page.tsx                 (replaced)
     src/app/api/search/recent/route.ts       (new)
     src/components/SaveSearch.tsx            (new)
     src/components/RecentSearches.tsx        (new)
     src/components/ExploreGrid.tsx           (new)

3. TEST
   - Open /explore with no search. The mixed-size grid shows photos and
     book covers alternating. Every seventh tile is a large block.
   - Search for a word. Tabs appear: Top, Books, People, Posts.
     The top results are ordered by popularity.
   - Reload /explore. Your searches appear as Recent chips above the grid.
   - Click "Clear all". The Recent list empties.

4. PUSH
   git add .
   git commit -m "Explore: recent searches, tabs, popularity ranking, mixed grid"
   git push
