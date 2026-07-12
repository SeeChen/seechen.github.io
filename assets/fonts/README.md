# Font Assets

This directory contains the self-hosted web fonts used by SeeChen Website.
The font binaries retain their upstream licenses and are not relicensed under
the website's GPL-3.0-only license.

## Font Roles

| Font | CSS family | Role |
| --- | --- | --- |
| Bodoni Moda | `SeeChen Brand` | English brand and display titles |
| JetBrains Mono | `SeeChen Mono` | English technical and metadata text |
| GNU Unifont | `SeeChen Pixel` | Chinese pixel and technical text |
| QuanHengDuLiang | `SeeChen Amber` | Chinese artistic and Amber text |

## Bodoni Moda

- Source: <https://github.com/google/fonts/tree/main/ofl/bodonimoda>
- License: SIL Open Font License 1.1
- License file: `licenses/BodoniModa-OFL.txt`

`BodoniModa-Variable.woff2` retains the upright variable font for future
display typography.

## JetBrains Mono

- Source: <https://github.com/JetBrains/JetBrainsMono>
- License: SIL Open Font License 1.1
- License file: `licenses/JetBrainsMono-OFL.txt`

## GNU Unifont

- Source: <https://unifoundry.com/unifont/index.html>
- Upstream version: 17.0.05
- License: SIL Open Font License 1.1
- License file: `licenses/GNUUnifont-OFL.txt`

`GNUUnifont-CJK.woff2` retains Latin text, punctuation, full-width forms,
CJK radicals, CJK Unified Ideographs, Extension A, and compatibility
ideographs from the Unicode Basic Multilingual Plane.

## QuanHengDuLiang

- Source: <https://github.com/kaonashi-tyc/Zi-QuanHengDuLiang>
- Upstream version: 0.2
- License: MIT License
- License file: `licenses/QuanHengDuLiang-MIT.txt`

`QuanHengDuLiang-Amber.woff2` contains only the Chinese characters used by
the Version A - Amber presentation. Regenerate the subset when its displayed
copy introduces new characters.
