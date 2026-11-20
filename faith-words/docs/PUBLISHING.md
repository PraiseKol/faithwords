# From web app to Google Play and the App Store

Faith Words is a plain web app. **Capacitor** wraps it in a real Android/iOS shell, so the same code becomes two store apps.

## 0. What you need (one-time)
| Thing | Cost | Notes |
|---|---|---|
| A computer with **Node 20+** | free | to run the build |
| **Android Studio** | free | builds the Android app (Windows, Mac or Linux) |
| **Google Play Console** account | one-time **US$25** | needs ID verification; new personal accounts must run a **closed test with 12+ testers for 14 days** before going public |
| A **Mac with Xcode** | — | iOS apps can only be built on a Mac (or a cloud Mac service such as Codemagic / Xcode Cloud / MacinCloud) |
| **Apple Developer Program** | **US$99 / year** | needed for TestFlight and the App Store |
| A **privacy policy** web page | free | both stores require a URL (see §6) |

## 1. Get the project on your computer
```
git clone https://github.com/PraiseKol/faithwords.git
cd faithwords/faith-words
```

## 2. Add the native shells (once)
```
npm run cap:init          # installs Capacitor + the notifications plugin, names the app "Faith Words" (com.faithwords.app)
npx cap add android
npx cap add ios           # Mac only
```
`com.faithwords.app` is the app's permanent ID. **Choose it now, you cannot change it after publishing.** If you want your own (e.g. `org.yourchurch.faithwords`), change it in `capacitor.config.json` before `cap add`.

## 3. Icons and splash screen
Put a 1024×1024 PNG called `icon-only.png` (and optionally `splash.png`, 2732×2732) in a folder `assets/`, then
```
npm run cap:assets
```
It generates every Android and iOS icon/splash size. (`icon.svg` in the project is the web icon; export it to PNG for this step.)

## 4. Build and run on your own phone
Every time the web code changes:
```
npm run cap:sync          # copies the web app into www/ and updates the native projects
npx cap open android      # opens Android Studio  → press ▶ with your phone plugged in (USB debugging on)
npx cap open ios          # opens Xcode           → pick your iPhone → ▶
```
Check these on a real phone: sign-in, an online match, sound, the bottom bar, **Settings → Daily verse reminder** (it only appears inside the app; allow notifications when asked).

## 5. Android → Google Play
1. In Android Studio: **Build → Generate Signed App Bundle → Android App Bundle (.aab)**. Create a new keystore, **back it up and never lose the password**; you need the same key for every update (or enrol in Play App Signing, which Google recommends: it lets Google hold the real signing key).
2. In **Play Console → Create app** (name Faith Words, free, app/game: *Game → Word*).
3. Complete the **App content** forms: privacy policy URL, ads (No), target audience (13+ keeps it simple; if you aim at children you enter the stricter Families policy), data safety (see §6), content rating questionnaire.
4. **Store listing:** short description (80 chars), full description, icon 512×512, feature graphic 1024×500, at least 2 phone screenshots (use the real app).
5. **Testing → Closed testing:** upload the `.aab`, add testers' Gmail addresses. New personal developer accounts must keep it running with **12+ testers opted in for 14 days**, then you can apply for **Production**.
6. **Production → Create release → upload the .aab → Roll out.** First review usually takes a few days.
Updates: increase `versionCode` (and `versionName`) in `android/app/build.gradle`, rebuild the .aab, upload.

## 6. Privacy policy and store forms (both stores)
Faith Words collects: email address (account), display name, gameplay data (scores, progress), and an anonymous user ID. It does **not** use ads or tracking. Say so. Typical answers: data is collected for *app functionality and account management*, stored with Supabase, not sold, not shared for advertising; users can request deletion (give an email address for that). Host a simple page (GitHub Pages / Notion public page / your church site) and paste its URL.
**Account deletion:** Apple and Google both require that an app with sign-in lets people delete their account (in the app *or* by a web form/email request that you honour). Tell me and I will add a "Delete my account" button to Settings.

## 7. iOS → App Store
1. In Xcode, select the **App** target → **Signing & Capabilities** → choose your Team (your Apple Developer account); the bundle ID is `com.faithwords.app`.
2. Set the version/build in **General**; set the Deployment Target (iOS 14+ is fine).
3. In **appstoreconnect.apple.com → My Apps → +** create the app with the same bundle ID.
4. In Xcode: **Product → Archive → Distribute App → App Store Connect → Upload**.
5. In App Store Connect, open **TestFlight**, wait for processing (about 15 min), add yourself and testers, and test on real iPhones.
6. Fill in the listing: description, keywords, support URL, privacy policy URL, category (Games → Word), age rating questionnaire, **App Privacy** ("nutrition labels", same answers as §6), and screenshots for the required iPhone sizes (6.9" and 6.5" displays; Xcode's simulator can take them).
7. **Submit for Review.** First review typically takes 1–3 days. Apple rejects apps that feel like "just a website"; Faith Words has native notifications, sound, offline play and accounts, which helps. Mention in the review notes how to test (a demo login) and that online play needs two players (the bot works alone).

## 8. Updating after launch
- **New puzzles/words:** no store update. Use **Admin → New puzzle packs** (see README, Phase 4).
- **Fixes and features to the app itself:** change the web code → `npm run cap:sync` → bump version → rebuild → upload to both stores (Google reviews in hours-days, Apple in 1–3 days).
- **Server changes** (`supabase/functions/fw-api`) go live the moment they are deployed, for all app versions. Keep them backward-compatible while old app versions are still installed.

## 9. Checklist before you press submit
- [ ] Real phone test on Android **and** iPhone (sign up, play, online match, background/foreground, notifications)
- [ ] Airplane-mode behaviour is graceful (the game plays offline against the bot)
- [ ] Privacy policy URL live; account-deletion path exists
- [ ] Supabase: Auth → turn on **leaked password protection**; set your real site/redirect URLs; email templates branded
- [ ] Supabase is on a plan that won't pause the project (free projects pause after a week of inactivity)
- [ ] App icon, screenshots, descriptions ready; the Bible quotes are KJV (public domain) so no licence is needed. If you add NIV/ESV text, you need their permission.
