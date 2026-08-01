# Number Match

A relaxing number-matching puzzle game for Android and iOS, built with the same architecture as WordBound.

## Stack

- React Native 0.81 (bare CLI)
- React Navigation 7
- Zustand 5 + AsyncStorage
- Reanimated 4
- Google Mobile Ads

## Project Structure

```text
src/
├── bootstrap.tsx
├── global/           # Shared hooks and components
├── infra/            # Ads, share links
├── modules/
│   └── number-match/
│       ├── components/
│       ├── constants/
│       ├── engine/   # UI-agnostic game logic
│       ├── hooks/
│       └── screens/
├── router/
└── store/
```

## Scripts

```bash
yarn install
yarn start
yarn android
yarn ios:setup && yarn ios
yarn app:check
```

## Milestones

1. Project setup, navigation, theme system, local storage, design system
2. Board rendering, tile interactions, match validation, scoring
3. Home, stats, settings, themes, persistence, coin economy
4. Animations, sound, haptics, ads, polish, Play Store release
