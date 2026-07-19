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

"""Extracts compact, ordered timeline previews from one source video."""

import argparse
import pathlib
import shutil
import subprocess


DEFAULT_INTERVAL_SECONDS = 5
DEFAULT_PREVIEW_WIDTH = 320


def parse_arguments() -> argparse.Namespace:
    """Parses command-line arguments.

    Returns:
        The validated command-line namespace.
    """
    parser = argparse.ArgumentParser(
        description='Extract ordered JPEG previews for the SeeChen player.',
    )
    parser.add_argument('source', type=pathlib.Path)
    parser.add_argument('output', type=pathlib.Path)
    parser.add_argument(
        '--interval',
        default=DEFAULT_INTERVAL_SECONDS,
        type=int,
        help='Seconds between preview frames.',
    )
    parser.add_argument(
        '--width',
        default=DEFAULT_PREVIEW_WIDTH,
        type=int,
        help='Preview width in pixels.',
    )
    parser.add_argument(
        '--ffmpeg',
        default=shutil.which('ffmpeg'),
        help='Path to the FFmpeg executable.',
    )
    return parser.parse_args()


def create_command(arguments: argparse.Namespace) -> list[str]:
    """Creates the deterministic FFmpeg preview command.

    Args:
        arguments: Parsed script arguments.

    Returns:
        FFmpeg arguments ready for subprocess execution.
    """
    output_pattern = arguments.output / '%03d.jpg'
    video_filter = (
        f'fps=1/{arguments.interval},'
        f'scale={arguments.width}:-2:flags=lanczos'
    )

    return [
        arguments.ffmpeg,
        '-y',
        '-i',
        str(arguments.source),
        '-an',
        '-vf',
        video_filter,
        '-q:v',
        '5',
        '-start_number',
        '0',
        str(output_pattern),
    ]


def main() -> None:
    """Validates source and settings, then extracts preview frames."""
    arguments = parse_arguments()

    if not arguments.source.is_file():
        raise FileNotFoundError(f'Source video not found: {arguments.source}')

    if not arguments.ffmpeg:
        raise RuntimeError('FFmpeg is required. Pass its path with --ffmpeg.')

    if arguments.interval <= 0 or arguments.width <= 0:
        raise ValueError('Interval and width must be positive integers.')

    arguments.output.mkdir(parents=True, exist_ok=True)
    subprocess.run(create_command(arguments), check=True)


if __name__ == '__main__':
    main()
