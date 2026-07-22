# Setup

## 1. Create the Firebase project (free)
1. Go to https://console.firebase.google.com → **Add project** → name it anything (e.g. "household-chores") → skip Google Analytics, not needed.
2. In the left sidebar: **Build → Firestore Database → Create database** → start in **production mode** → pick any region close to you.
3. Left sidebar: **Build → Firestore Database → Rules** tab, replace the contents with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /chores/{choreId} {
         allow read: if true;
         allow update: if request.auth != null
           || request.resource.data.diff(resource.data).affectedKeys().hasOnly(['lastCompleted']);
         allow create, delete: if request.auth != null;
       }
       match /events/{eventId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```
   Anyone can view the board and mark a chore done (that only ever changes the `lastCompleted` field). Adding, deleting, or otherwise editing a chore — and any change to events at all — requires a signed-in account.

## 1b. Turn on login for the admin page
1. Left sidebar: **Build → Authentication → Get started**.
2. Under "Sign-in method," enable **Email/Password**.
3. Go to the **Users** tab → **Add user** → enter an email and password for yourself (add one per person who should be able to edit chores). This is the login you'll use on `chore-admin.html` — no signup flow, you create accounts directly here.

## 2. Get your config
1. Click the gear icon → **Project settings** → scroll to "Your apps" → click the `</>` (web) icon → register an app (any nickname) → **don't** check hosting yet.
2. Copy the `firebaseConfig` object it shows you.
3. Paste it into **both** `chore-board.html` and `chore-admin.html`, replacing the placeholder object near the top of each file's `<script type="module">` block.

## 3. Host the files (free)
Easiest path — Firebase Hosting, since you already have the project open:
1. Install the CLI once: `npm install -g firebase-tools`
2. From the folder with your three files: `firebase login`, then `firebase init hosting` (pick your project, public directory = current folder, single-page app = No).
3. `firebase deploy` — it prints a live URL like `yourproject.web.app`.

(GitHub Pages or Cloudflare Pages work exactly as well if you'd rather not touch the CLI — just push/drag the same three files.)

## 4. Add your chores and events
Open `chore-admin.html` at your new URL, sign in with the email/password you created in step 1b, and use the **Chores** and **Events** tabs to add each one — no need to touch Firestore's console directly, though you can if you prefer.

Note: you now have five files to upload/deploy together — `chore-board.html`, `chore-admin.html`, `recurrence.js`, `calendar.js`, and this `SETUP.md`. `chore-board.html` loads both `recurrence.js` and `calendar.js`, so all four files need to sit in the same folder.

Events can optionally repeat, using the same recurrence engine as chores — set "Repeats" on any event in the admin page (fixed days, X-times-per-Y-days, months, or years). A repeating event shows a ↻ next to its title on the board.

## 5. Put it on the iPad
1. Open `chore-board.html`'s URL in Safari on the iPad.
2. Share icon → **Add to Home Screen**.
3. Open it from the Home Screen icon (now full-screen, no browser bar).
4. Settings → Accessibility → **Guided Access** → turn on, set a passcode, triple-click the side button while the board is open to lock the iPad into just this app.

From here, editing chores from your phone (`chore-admin.html`) updates the wall board within about a minute automatically.
