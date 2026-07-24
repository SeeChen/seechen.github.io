<!--
seechen.github.io
https://github.com/SeeChen/seechen.github.io

Copyright (C) 2024-2026 LEE SEE CHEN.

SPDX-License-Identifier: GPL-3.0-only
-->

# Media Tools

This directory contains offline media-preparation tools used by the SeeChen
website. These Python and FFmpeg dependencies are development tools only; they
are not loaded by the website and do not add runtime dependencies to the
native JavaScript application.

Run every command from the repository root. Use a script's `--help` output as
the authoritative reference for its current arguments and defaults:

```bash
python3 scripts/media/convert_images_to_avif.py --help
```

## Tools

| Script | Purpose |
| --- | --- |
| `convert_images_to_avif.py` | Convert JPEG and PNG images to AVIF |
| `encode_fmp4_vod.py` | Encode one video as the constrained fMP4 HLS VOD profile used by the native player |
| `extract_video_previews.py` | Extract ordered JPEG frames for timeline previews |

## Requirements

All scripts require Python 3. The image converter additionally requires
Pillow with AVIF support. The video tools require FFmpeg.

### Windows

```powershell
py -3.11 -m pip install Pillow pillow-avif-plugin
ffmpeg -version
```

When FFmpeg is not available through `PATH`, pass the executable explicitly:

```powershell
py -3.11 scripts/media/encode_fmp4_vod.py input.mp4 output/hls `
    --ffmpeg "C:\Tools\ffmpeg\bin\ffmpeg.exe"
```

### WSL or Linux

```bash
python3 -m pip install Pillow pillow-avif-plugin
ffmpeg -version
```

The installed FFmpeg build must provide the H.264 `libx264` and AAC encoders.

## Convert Images to AVIF

Convert one image:

```bash
python3 scripts/media/convert_images_to_avif.py input.jpg output.avif
```

Convert every supported image directly inside a directory:

```bash
python3 scripts/media/convert_images_to_avif.py assets/images
```

Convert a directory recursively while preserving its relative structure:

```bash
python3 scripts/media/convert_images_to_avif.py source-images output-images \
    --recursive
```

The converter accepts `.jpg`, `.jpeg`, and `.png` files without regard to
suffix case. It preserves PNG transparency and the source ICC color profile,
but removes EXIF metadata. Source images are never deleted. Existing AVIF
files are skipped unless `--overwrite` is supplied.

When multiple source files would produce the same destination, such as
`cover.jpg` and `cover.png`, the converter reports a collision instead of
silently replacing one result.

## Encode fMP4 VOD

Create the single-rendition fMP4 HLS package expected by the native SeeChen
player:

```bash
python3 scripts/media/encode_fmp4_vod.py input.mp4 output/hls
```

The output directory contains:

```text
output/hls/
├── index.m3u8
├── init.mp4
├── segment-000.m4s
├── segment-001.m4s
└── ...
```

The profile is intentionally constrained: video on demand, one rendition,
H.264 video, optional AAC audio, independent four-second fMP4 segments, and no
encryption, DRM, alternate audio, or embedded subtitles. Keeping the encoder
output constrained allows the native browser player to avoid MPEG-TS
transmuxing.

## Extract Timeline Previews

Extract a JPEG preview every five seconds at the default width:

```bash
python3 scripts/media/extract_video_previews.py input.mp4 output/previews
```

Override the interval and width:

```bash
python3 scripts/media/extract_video_previews.py input.mp4 output/previews \
    --interval 10 \
    --width 480
```

Frames are written in timeline order as `000.jpg`, `001.jpg`, and so on. Use
the same final video source that is supplied to the VOD encoder so preview
timestamps remain aligned with playback.

## Recommended Video Workflow

1. Finalize the source MP4 before generating derived assets.
2. Encode the fMP4 HLS package with `encode_fmp4_vod.py`.
3. Extract timeline previews from the same MP4 with
   `extract_video_previews.py`.
4. Add the generated paths and video metadata to the relevant page data.
5. Test seeking, the final segment, replay, and preview alignment in the
   website player.

Generated images and video retain the copyright and licensing terms of their
source media. Running these GPL-licensed tools does not relicense the generated
assets.
