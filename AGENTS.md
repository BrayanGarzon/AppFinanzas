# PocketFlow contributor notes

Read `planner.md` and the relevant files in `docs/` before extending the app. Keep work in the current phase; do not implement later modules early.

## Stack and layout

- Expo SDK 57, React Native 0.86, TypeScript, Expo Router, npm.
- Route files live in root `app/`; reusable components in `src/components/`; domain logic in `src/features/`; types in `src/types/`; utilities in `src/utils/`.
- Use Expo's versioned SDK 57 documentation and install Expo SDK modules with `npx expo install`.
- Use integer COP amounts for financial storage and calculations. Follow `docs/financial-model.md`.
- Keep private keys and service-role credentials out of the client.

## Checks

Run `npm test`, `npx tsc --noEmit`, and `npx expo export --platform web` for changes that affect app behavior. Run Expo Doctor when network access permits; document external-service failures separately from project errors.

## Product constraints

- PocketFlow is private, iPhone-first, and starts in COP.
- Do not add NativeWind, charting, Supabase, or new domain features before their planner phase.
- Do not publish to app stores or add recurring paid services without updating the plan.
