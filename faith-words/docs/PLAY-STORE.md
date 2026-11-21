# Launch Faith Words on Google Play — easy path

Run every command inside the **faith-words** app folder (the one that contains `package.json` and `index.html`).

## A. One-time setup on your PC
1. Install Node.js (LTS) from nodejs.org and Android Studio from developer.android.com/studio (accept the default components).
2. Create a Google Play Developer account at play.google.com/console (US$25 once). Verify your identity and phone when asked.

## B. Build the Android app
```
git clone https://github.com/PraiseKol/faithwords.git
cd faithwords/faith-words
npm run cap:init
npm run android:add
npm run cap:assets
npm run android:open
```
Android Studio opens. Wait for the bottom bar to finish "Gradle sync".

## C. Test on your phone (optional but wise)
Plug the phone in (USB debugging on) and press the green ▶ Run button.

## D. Make the release file (AAB)
1. In Android Studio: Build → Generate Signed App Bundle / APK → Android App Bundle → Next.
2. Create new keystore → save the .jks file and its passwords somewhere safe (back it up; losing it is painful).
3. Choose "release", Finish. The file is `android/app/release/app-release.aab`.

## E. Create the app in Play Console
1. Create app → name Faith Words → App → Free.
2. Fill the "Set up your app" tasks:
   - Privacy policy: https://faithwords.vercel.app/privacy.html
   - App access: "All or some functionality is restricted" → give a test email and password for a real test account.
   - Ads: No.
   - Content rating: answer the questionnaire (no violence, etc.).
   - Target audience: 13+ (not children).
   - Data safety: collected = email, name, app activity (game progress); encrypted in transit = yes; users can request deletion = yes; deletion link https://faithwords.vercel.app/privacy.html#delete.
   - Store listing: short + full description, icon (google-play-icon-512.png), feature graphic, 2–8 phone screenshots.
3. Testing → Closed testing → Create track → upload the AAB → add testers' Gmail addresses (12+) → Release. Each tester must opt in with the link and keep it installed for 14 days.
4. After 14 days: Dashboard → Apply for production → Production → Create release → same AAB (or a new one) → send for review (a few days).

## F. Updating later
Raise `versionCode` (+1) and `versionName` in `android/app/build.gradle`, rebuild the AAB, upload it to a new release. New puzzle packs need no update.
