# 34. Credential card

One card for every credential, on home and on `/credentials/`. Until now the two looked different: home had a stitched "patch", the credentials page a plain card with an award mark.

- **Edge:** the patch's dashed stitch, just inside the card.
- **Top row:** the award mark on the left, the credential's own badge on the right (56px; 44px in home's narrow column).
- **Then:** the level in mono (Professional, Associate, Foundations, Fundamentals…), the name, the issuer, and Verify at the foot.
- **Whole card is the link,** on both pages, as home's already was.
- **Badges:** the real badge image for each credential. 24 from Credly, the four Microsoft Learn ones from Microsoft. They're in `badges/`, mapped by title in `badges.json`.
- **No badge?** None is missing today. When one is, the plan is the issuer's official logo in that spot.

It runs over the real built site, so nothing in `apps/portfolio` changes.

```bash
pnpm build
```

```bash
node prototypes/34-credential-card/serve.mjs
```

Open `/` and `/credentials/`. It prints an address for a phone on the same Wi-Fi too.
