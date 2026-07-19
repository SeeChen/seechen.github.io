#!/usr/bin/env python3
#
# seechen.github.io
# https://github.com/SeeChen/seechen.github.io
#
# Copyright (C) 2024-2026 LEE SEE CHEN.
#
# This file is licensed under the GNU General Public License v3.0 (GPLv3).
# You can redistribute it and/or modify it under the terms of the GPLv3.
# For more details, see <https://www.gnu.org/licenses/>.
#
# SPDX-License-Identifier: GPL-3.0-only

"""Encodes one source video as the constrained SeeChen fMP4 VOD profile."""

import argparse
import pathlib
import shutil
import subprocess


SEGMENT_DURATION_SECONDS = 4
VIDEO_WIDTH = 1920
VIDEO_HEIGHT = 1080
VIDEO_FRAME_RATE = 30


def parse_arguments() -> argparse.Namespace:
    """Parses command-line arguments.

    Returns:
        The validated command-line namespace.
    """
    parser = argparse.ArgumentParser(
        description='Encode an MP4 source as single-rendition fMP4 HLS VOD.',
    )
    parser.add_argument('source', type=pathlib.Path)
    parser.add_argument('output', type=pathlib.Path)
    parser.add_argument(
        '--ffmpeg',
        default=shutil.which('ffmpeg'),
        help='Path to the FFmpeg executable.',
    )
    return parser.parse_args()


def create_command(
    ffmpeg: str,
    source: pathlib.Path,
    output: pathlib.Path,
) -> list[str]:
    """Creates the constrained FFmpeg encoding command.

    Args:
        ffmpeg: Path to the FFmpeg executable.
        source: Source MP4 path.
        output: Destination directory.

    Returns:
        FFmpeg arguments ready for subprocess execution.
    """
    segment_pattern = output / 'segment-%03d.m4s'
    playlist_path = output / 'index.m3u8'
    video_filter = (
        f'scale={VIDEO_WIDTH}:{VIDEO_HEIGHT}:'
        'force_original_aspect_ratio=decrease:force_divisible_by=2,'
        f'pad={VIDEO_WIDTH}:{VIDEO_HEIGHT}:(ow-iw)/2:(oh-ih)/2,'
        'format=yuv420p'
    )

    return [
        ffmpeg,
        '-y',
        '-i',
        str(source),
        '-map',
        '0:v:0',
        '-map',
        '0:a:0?',
        '-vf',
        video_filter,
        '-r',
        str(VIDEO_FRAME_RATE),
        '-c:v',
        'libx264',
        '-preset',
        'slow',
        '-crf',
        '22',
        '-maxrate',
        '6M',
        '-bufsize',
        '12M',
        '-profile:v',
        'high',
        '-level:v',
        '4.1',
        '-g',
        str(VIDEO_FRAME_RATE * SEGMENT_DURATION_SECONDS),
        '-keyint_min',
        str(VIDEO_FRAME_RATE * SEGMENT_DURATION_SECONDS),
        '-sc_threshold',
        '0',
        '-force_key_frames',
        f'expr:gte(t,n_forced*{SEGMENT_DURATION_SECONDS})',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-ac',
        '2',
        '-ar',
        '48000',
        '-f',
        'hls',
        '-hls_time',
        str(SEGMENT_DURATION_SECONDS),
        '-hls_playlist_type',
        'vod',
        '-hls_segment_type',
        'fmp4',
        '-hls_fmp4_init_filename',
        'init.mp4',
        '-hls_segment_filename',
        str(segment_pattern),
        '-hls_flags',
        'independent_segments',
        str(playlist_path),
    ]


def main() -> None:
    """Validates paths and runs the encoder."""
    arguments = parse_arguments()

    if not arguments.source.is_file():
        raise FileNotFoundError(f'Source video not found: {arguments.source}')

    if not arguments.ffmpeg:
        raise RuntimeError('FFmpeg is required. Pass its path with --ffmpeg.')

    arguments.output.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        create_command(
            arguments.ffmpeg,
            arguments.source,
            arguments.output,
        ),
        check=True,
    )


if __name__ == '__main__':
    main()
