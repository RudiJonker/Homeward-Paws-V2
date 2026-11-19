# Homeward Paws V2

Android-first Expo app for South Africa. This first milestone runs the complete missing-animal journey with in-memory sample data.

## Run on an Android phone over USB

1. Enable USB debugging and confirm the phone with `adb devices -l`.
2. Install Expo Go on the phone.
3. From this folder, run `npm run android -- --localhost`.

Sample changes reset whenever the app reloads.

## Test walkthrough

1. Open **Report** and choose **Report missing**.
2. Choose Milo or Luna, check the public preview, then tap **Publish & share**. The Android share text is labelled `PREVIEW` until a public report URL is configured.
3. Open **Profile**, choose **Visitor (guest)**, then open **Browse** and the new public alert.
4. Return to **Profile**, choose **Signed-in neighbour**, open the alert, tap **I saw this animal**, and send a private sighting.
5. In **Profile**, switch to **Animal owner**. Open **Home**, then **View sightings**.
6. Tap **Mark reunited** and confirm. The alert leaves Browse and appears under Profile's past cases.

## Selected versions

- Node 22.23.5 and npm 10.9.9
- Expo SDK 58 (`expo` 58.0.26)
- React Native 0.88.1 and React 19.3.0
- Expo Router 58.0.32
- JavaScript route and application files only

## Later milestones

The Supabase project is not changed in this milestone. Connecting project `mjoovjjoagkstfrzovyf`, RLS/storage policies, email/password authentication, durable draft restoration, real public report URLs, Google sign-in, and password recovery remain follow-up work.
