# Editorial media sources

Verified 17 October 2026. Local-only implementation; no deployment, commit or push.

- Visual reference: https://nataliatimea.com/ — inspected live via web and Chromium. Inspiration: close-spaced sans serif headlines, generous whitespace, black-to-grey hierarchy, simple navigation and rounded project surfaces. No identity, content or assets copied. A reference screenshot is retained locally in ignored `artifacts/reference-desktop.png`.
- Existing production site https://dhomhafiz.dev/ was unavailable through the web tool. Existing repository content was used.
- Inter official project: https://rsms.me/inter/ ; font downloaded from https://rsms.me/inter/font-files/InterVariable.woff2. Official license: https://raw.githubusercontent.com/rsms/inter/master/LICENSE.txt. Bundled unchanged in `src/app/fonts/Inter-OFL.txt` (SIL Open Font License 1.1).
- Owner photo: existing `public/images/hafiz-480.webp`, from this project's owner assets; no external portrait used.
- `dental-home.mp4`, `dental-booking.mp4` and corresponding WebP posters: browser recordings/screenshots of this repository's own `/demo-dental/` page, using its existing locally authored `public/images/dental/studio.svg`. Recorded from the local production export with Playwright, encoded with FFmpeg. The second video demonstrates treatment selection. These are playable H.264 videos, not canvas animation. No external stock video or reference-site footage used.
- Still Dental is fictional and clearly labelled Concept Project. No client, testimonial or business results are asserted.
- No verified WhatsApp number was present. The config remains empty, CTA is disabled with “Nombor WhatsApp belum ditetapkan”; existing email is available.

## Update: full-width hero and Pexels footage

User-selected video: https://www.pexels.com/video/modern-programmer-s-workspace-with-code-display-34279733/
Creator: Jakub Zerdzicki. Verified official Pexels license at https://www.pexels.com/license/ permits free website use and modification. Attribution is optional; a visible creator/Pexels credit is included. Stock workspace imagery is not presented as a client project or the owner's actual workplace.

Official download redirect: https://videos.pexels.com/video-files/34279733/14522345_3840_2160_25fps.mp4
The original stays in ignored `.media-source/pexels-34279733.mp4`; the deployed `workspace-34279733.mp4` is re-encoded at 1120px, 25fps, CRF25, H.264 with no audio and faststart. The WebP poster is extracted at one second. This replaces the first dental video slide; the second interactive dental recording remains.

Header, footer, main and section surfaces now span the viewport with no outer horizontal gutter or maximum container width. Hero video and its fallback have zero inset, a 16:9 container and no border radius. Object-fit contain retains the complete frame on mobile. The full-width headline scales to the viewport with no text column cap.

## Single-video hero update

The hero now groups one looping Pexels video and the introduction in one semantic section. Carousel state, slide indicators, next/previous navigation and the second video source are removed. A small overlay pause/play control remains for accessible motion control. Desktop video height is constrained to leave space for the introduction; mobile retains the complete 16:9 frame. Reduced motion, Save-Data, blocked autoplay and poster fallback remain supported. Current source: `src/components/features/editorial/HeroVideo.tsx` and `heroVideo` in `src/config/editorial.ts`.

Latest UI adjustment: visible video controls removed at the user's request. The single video still plays muted and loops; reduced motion/Save-Data and blocked autoplay show the poster without requesting user playback.

## Dental photograph update

User-selected photo: https://www.pexels.com/photo/doctor-and-patient-during-medical-procedure-15688027/
Photographer: Jonathan Borba. Source: https://images.pexels.com/photos/15688027/pexels-photo-15688027.jpeg
License verified: https://www.pexels.com/license/ (free website use and modification; no endorsement implied). Original retained in ignored `.media-source/dental-15688027.jpg`. Converted to a 640 × 720 WebP for the existing demo hero frame. The fictional demo status remains unchanged. Portfolio card screenshot refreshed to show the same image.

## Performance asset update

The same Pexels workspace video now has a 640px/24fps H.264 mobile rendition at CRF29 and a 768px WebP poster. The existing 1120px desktop media stays intact. An avatar thumbnail is derived from the existing hafiz-cinematic photo.

Inter Latin variable WOFF2 (weights 100–900), officially served by Google Fonts: https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2 . Source stylesheet: https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap . Self-hosted at src/app/fonts/inter-latin-variable.woff2 with the existing Inter SIL OFL license. The original full font is retained but is not preloaded. No Open Graph image or alt changes.
