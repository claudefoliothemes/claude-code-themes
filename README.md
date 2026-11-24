# Claude Code themes from ClaudeFolio

Thirty-seven themes for the Claude Code desktop app. Thirty-four paint the app dark and play a moving scene behind your conversation. OLED Black is true black with nothing moving, made for OLED screens. Two are light: Morning Light, a sunlit room that moves, and Clean Slate, a calm theme where nothing moves. They are built to stay light, so the app's CPU use stays close to idle. Designed by ClaudeFolio together with Claude.

| | |
|---|---|
| ![Sky Clock](previews/sky-clock.gif)<br>**Sky Clock**: the sky follows your computer's clock, from dawn to a starry night | ![Cyber City](previews/cyber-city.gif)<br>**Cyber City**: a neon city in the rain, with flying cars |
| ![Digital Rain](previews/digital-rain.gif)<br>**Digital Rain**: Matrix-style digital rain, green code falling in two layers | ![Neon Horizon](previews/neon-horizon.gif)<br>**Neon Horizon**: a striped sun and a grid rolling toward you |
| ![Braille Stars](previews/braille-stars.gif)<br>**Braille Stars**: twinkling braille-dot stars and a shooting star | ![Firefly Night](previews/firefly-night.gif)<br>**Firefly Night**: fireflies blinking at the edge of a pine forest |
| ![Amber Terminal](previews/amber-terminal.gif)<br>**Amber Terminal**: log lines scrolling up an old amber CRT | ![Night Sakura](previews/night-sakura.gif)<br>**Night Sakura**: petals tumbling past a moonlit branch |
| ![Lofi Rain](previews/lofi-rain.gif)<br>**Lofi Rain**: a lofi rainy window, city lights, and a steaming mug | ![Pastel Nebula](previews/pastel-nebula.gif)<br>**Pastel Nebula**: pastel clouds, a ringed planet, and shooting stars |
| ![Lantern Alley](previews/lantern-alley.gif)<br>**Lantern Alley**: paper lanterns swaying over a rainy Japanese street | ![Pixel Camp](previews/pixel-camp.gif)<br>**Pixel Camp**: a pixel-art campfire, a lit tent, and a blinking owl |
| ![Autumn Maple](previews/autumn-maple.gif)<br>**Autumn Maple**: maple leaves falling past a torii gate under the moon | ![Pixel Den](previews/pixel-den.gif)<br>**Pixel Den**: a pixel-art room at night, rain, a glowing monitor, a sleeping cat |
| ![Morning Light](previews/morning-light.gif)<br>**Morning Light**: a light theme, a sunlit room with sunbeams and steaming tea | ![Neon Coast](previews/neon-coast.gif)<br>**Neon Coast**: a neon beach boulevard at sunset, palms and a convertible |
| ![Pixel Arcade](previews/pixel-arcade.gif)<br>**Pixel Arcade**: a pixel-art arcade, glowing cabinets and a claw machine | ![Tokyo Crossing](previews/tokyo-crossing.gif)<br>**Tokyo Crossing**: a rainy scramble crossing, umbrellas and a passing train |
| ![Pixel Shrine](previews/pixel-shrine.gif)<br>**Pixel Shrine**: a pixel-art pagoda by a moonlit lake, cherry petals falling | ![Pixel Village](previews/pixel-village.gif)<br>**Pixel Village**: a pixel-art snowy village, aurora, and a lit Christmas tree |
| ![Pixel Pets](previews/pixel-pets.gif)<br>**Pixel Pets**: a sleeping cat, a wagging puppy, and a goldfish in a cozy room | ![Slime Meadow](previews/slime-meadow.gif)<br>**Slime Meadow**: cute pastel slimes hopping in a moonlit meadow |
| ![Pixel Café](previews/pixel-cafe.gif)<br>**Pixel Café**: rain on the window, warm lamps, steaming mugs, and a sleeping cat | ![Pixel Cosmos](previews/pixel-cosmos.gif)<br>**Pixel Cosmos**: a ringed planet, nebulas, asteroids, and a little rocket cruising past |
| ![Christmas Eve](previews/christmas-eve.gif)<br>**Christmas Eve**: a crackling fire, stockings, a twinkling tree, and a toy train | ![Summit Sunrise](previews/summit-sunrise.gif)<br>**Summit Sunrise**: a mountain sunrise with a new line of motivation every 15 seconds |
| ![Window Clock](previews/window-clock.gif)<br>**Window Clock**: a clock and calendar on your local time, and a window that follows the hour and the season | ![Low Orbit](previews/low-orbit.gif)<br>**Low Orbit**: night over Earth from orbit, city lights, an aurora, and a space station |
| ![Summer Dusk](previews/summer-dusk.gif)<br>**Summer Dusk**: an anime-style evening sky, power lines and a little train | ![Good Vibes](previews/good-vibes.gif)<br>**Good Vibes**: a new line of encouragement every hour, on your clock |
| ![Ink Wave](previews/ink-wave.gif)<br>**Ink Wave**: woodblock-print waves rolling past a red sun | ![Fireside](previews/fireside.gif)<br>**Fireside**: a crackling hearth, snow at the window, and a sleeping cat |
| ![Rooftop Santa](previews/rooftop-santa.gif)<br>**Rooftop Santa**: Santa waving from a snowy rooftop beside the chimney | ![Sleigh Ride](previews/sleigh-ride.gif)<br>**Sleigh Ride**: reindeer pull the sleigh across the moon, the lead one's red nose glowing |
| ![Holiday Lights](previews/holiday-lights.gif)<br>**Holiday Lights**: string lights, a lit pine and falling snow | ![Clean Slate](previews/clean-slate.png)<br>**Clean Slate**: white and soft gray, nothing moving |
| ![OLED Black](previews/oled-black.png)<br>**OLED Black**: true black for OLED screens, nothing moving | |

The chat in these previews is made up, to show the colors.

## Install

In Claude Code, run:

```
/plugin install digital-rain --marketplace claudefoliothemes/claude-code-themes
```

Swap `digital-rain` for any theme: `sky-clock`, `good-vibes`, `braille-stars`, `neon-horizon`, `firefly-night`, `amber-terminal`, `night-sakura`, `holiday-lights`, `rooftop-santa`, `sleigh-ride`, `cyber-city`, `neon-coast`, `autumn-maple`, `summer-dusk`, `lofi-rain`, `lantern-alley`, `tokyo-crossing`, `pastel-nebula`, `ink-wave`, `fireside`, `pixel-camp`, `pixel-den`, `pixel-arcade`, `pixel-shrine`, `pixel-village`, `pixel-pets`, `slime-meadow`, `pixel-cafe`, `pixel-cosmos`, `christmas-eve`, `summit-sunrise`, `window-clock`, `low-orbit`, `morning-light`, `oled-black`, or `clean-slate`. Answer `y` to add the marketplace, then pick the user scope so the theme follows you into every session.

Run one theme at a time. Every theme sets the whole look, so whichever loads last wins. To switch, turn one off and another on:

```
claude plugin disable digital-rain@claudefolio-themes
```

```
claude plugin enable neon-horizon@claudefolio-themes
```

## What you need

- The Claude desktop app (Code tab) or the Claude mobile app. The terminal keeps its own look.
- Claude Code 2.1.324 or later.
- Dark mode for every theme except Morning Light and Clean Slate, which need light mode.
- **Windows:** turn on Settings > Personalization > Colors > **Transparency effects**. With it off, the app makes its glass fully opaque and hides the scene, so you see the colors but no backdrop.
- **macOS:** turn off System Settings > Accessibility > Display > **Reduce transparency**, for the same reason.

## Light on your CPU

A backdrop repaints the whole window every time anything in it changes. So every scene here moves on a shared beat (a tenth of a second, or slower), and the window repaints a few times a second at most, however many things are moving. Nothing animates smoothly 60 times a second.

Measured in headless Chrome at 1920x1080, averaged over 12 seconds. An empty page measured about 0.15 to 0.2 CPU cores.

| Theme | CPU cores |
|---|---|
| Digital Rain | 0.44 |
| Neon Horizon | 0.32 |
| Braille Stars | 0.29 |
| Ink Wave | 0.29 |
| Lofi Rain | 0.28 |
| Pixel Den | 0.26 |
| Autumn Maple | 0.27 |
| Pixel Village | 0.27 |
| Pixel Pets | 0.27 |
| Pastel Nebula | 0.26 |
| Firefly Night | 0.26 |
| Amber Terminal | 0.25 |
| Holiday Lights | 0.25 |
| Sleigh Ride | 0.25 |
| Pixel Café | 0.25 |
| Rooftop Santa | 0.21 |
| Tokyo Crossing | 0.24 |
| Pixel Cosmos | 0.24 |
| Summer Dusk | 0.23 |
| Summit Sunrise | 0.23 |
| Neon Coast | 0.22 |
| Christmas Eve | 0.22 |
| Low Orbit | 0.22 |
| Pixel Arcade | 0.21 |
| Sky Clock | 0.20 |
| Good Vibes | 0.20 |
| Cyber City | 0.20 |
| Lantern Alley | 0.20 |
| Pixel Camp | 0.19 |
| Fireside | 0.18 |
| Window Clock | 0.18 |
| Morning Light | 0.18 |
| Night Sakura | 0.17 |
| Pixel Shrine | 0.17 |
| Slime Meadow | 0.17 |
| Clean Slate | nothing moves |
| OLED Black | nothing moves |

If your system asks apps to reduce motion, every scene holds still.

Sky Clock reads your computer's local time when a session starts and sets its sky to match: dawn around 6:00, sunset around 18:30, night after 20:00. After that the sky moves on its own, about once a minute. Good Vibes keeps time the same way: its card shows a new line every hour, matched to the time of day, under a greeting for the morning, afternoon, evening, or late night. Window Clock reads the time the same way, plus today's date, your time zone's short name, and the season (flipped for time zones south of the equator): its clock shows the hour and minute with AM or PM, its calendar turns over at midnight, and the view out its window changes with the hour and the season.

## Troubleshooting

**The colors changed but there's no backdrop.** Check the transparency setting under "What you need".

**The backdrop shows but doesn't move.** Some app builds freeze a scene whose SVG holds an `@media` rule (other than reduced motion) or `shape-rendering`. These themes use neither. Some builds also freeze a mod loaded straight from a folder, so install from this marketplace rather than with `--plugin-dir`.

**Typing feels slow.** Try a lighter theme from the table, and tell us which one lagged.

## Make your own

The scenes are plain SVG built by small scripts in `tools/scenes/`, and one build script turns each into a mod, from the palettes in `tools/themes.config.mjs`:

```
node tools/build-themes.mjs --out themes
```

`tools/render-previews.mjs` renders the previews. It needs Chrome and an ffmpeg with libx264.

Themes install from zips on the [GitHub releases](https://github.com/claudefoliothemes/claude-code-themes/releases), so each zip's download count shows how often that theme is installed. `node tools/release-themes.mjs --publish` builds the zips, uploads any new ones, and points the marketplace at them. It needs a `GITHUB_TOKEN` with write access to the repo. An uploaded zip is never replaced: to ship a change, bump `VERSION` in `tools/themes.config.mjs` and rebuild.

## License

MIT. See [LICENSE](LICENSE).

ClaudeFolio is not affiliated with Anthropic. Claude and Claude Code are trademarks of Anthropic.
