CHAT: GROUP PHOTOS, WHATSAPP-STYLE ROWS, DOODLE BACKGROUND
==========================================================

1. SCHEMA (manual)
   Follow prisma/SCHEMA-ADDITIONS.txt. Add one line to model Conversation,
   then run:

     npx prisma validate
     npx prisma generate
     npm run prisma:migrate      (name it: add_group_avatars)

2. UNZIP
   From the project folder:

     unzip -o chat-changes.zip

   Files added or replaced:
     src/lib/chatTime.ts                                  (new)
     src/components/Avatar.tsx                            (new)
     src/components/ChatDoodles.tsx                       (new)
     src/components/GroupAvatarUpload.tsx                 (new)
     src/app/api/conversations/[id]/avatar/route.ts       (new)
     src/app/chats/page.tsx                               (replaced)
     src/app/chats/[id]/page.tsx                          (replaced)

3. TEST
   - Chat list: each row shows the avatar, name, last message with
     "You:" or the sender's name, and the time. Rows are ordered by the
     most recent message.
   - A person with no photo shows a grey circle with a white silhouette.
     A group with no photo shows the two-person silhouette.
   - Open a group as an admin. "Change group photo" appears under the
     group name. Upload an image; it replaces the silhouette.
   - Open a one-to-one or group chat. The doodles sit behind the messages.

4. PUSH
   git add .
   git commit -m "Chats: WhatsApp-style rows, group photos, default avatars, doodle background"
   git push
