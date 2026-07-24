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

"""Converts JPEG and PNG source images into web-ready AVIF files."""

import argparse
import importlib
import pathlib
import sys
from typing import Any


DEFAULT_QUALITY = 82
DEFAULT_SPEED = 6
SUPPORTED_SUFFIXES = frozenset({'.jpeg', '.jpg', '.png'})


def parse_arguments() -> argparse.Namespace:
    """Parses command-line arguments.

    Returns:
        The parsed command-line namespace.
    """
    parser = argparse.ArgumentParser(
        description=(
            'Convert one JPEG/PNG image or a directory of images to AVIF. '
            'Source files are never deleted.'
        ),
        epilog=(
            'AVIF support requires Pillow with AVIF enabled, or '
            'Pillow plus pillow-avif-plugin.'
        ),
    )
    parser.add_argument(
        'source',
        type=pathlib.Path,
        help='Source image or directory.',
    )
    parser.add_argument(
        'output',
        nargs='?',
        type=pathlib.Path,
        help=(
            'Output AVIF path for one image, or output directory for a '
            'source directory. Defaults to the source location.'
        ),
    )
    parser.add_argument(
        '--recursive',
        action='store_true',
        help='Include supported images in nested source directories.',
    )
    parser.add_argument(
        '--overwrite',
        action='store_true',
        help='Replace existing AVIF files.',
    )
    parser.add_argument(
        '--quality',
        default=DEFAULT_QUALITY,
        type=int,
        help=f'AVIF quality from 0 to 100. Default: {DEFAULT_QUALITY}.',
    )
    parser.add_argument(
        '--speed',
        default=DEFAULT_SPEED,
        type=int,
        help=(
            'Encoder speed from 0 (slowest) to 10 (fastest). '
            f'Default: {DEFAULT_SPEED}.'
        ),
    )
    arguments = parser.parse_args()

    if not 0 <= arguments.quality <= 100:
        parser.error('--quality must be between 0 and 100.')

    if not 0 <= arguments.speed <= 10:
        parser.error('--speed must be between 0 and 10.')

    return arguments


def load_image_modules() -> tuple[Any, Any]:
    """Loads Pillow and registers an available AVIF encoder.

    Returns:
        The Pillow Image and ImageOps modules.

    Raises:
        RuntimeError: Pillow or AVIF encoding support is unavailable.
    """
    try:
        from PIL import Image
        from PIL import ImageOps
    except ImportError as error:
        raise RuntimeError(
            'Pillow is required. Install Pillow and pillow-avif-plugin.',
        ) from error

    try:
        importlib.import_module('pillow_avif')
    except ModuleNotFoundError as error:
        if error.name != 'pillow_avif':
            raise

        # Recent Pillow builds can provide AVIF without the external plugin.
        pass

    Image.init()

    if 'AVIF' not in Image.SAVE:
        raise RuntimeError(
            'No AVIF encoder is available. Install pillow-avif-plugin or '
            'a Pillow build with AVIF support.',
        )

    return Image, ImageOps


def discover_sources(
    source: pathlib.Path,
    recursive: bool,
) -> list[pathlib.Path]:
    """Finds supported source images in deterministic path order.

    Args:
        source: Source image or directory.
        recursive: Whether nested directories are included.

    Returns:
        Supported image paths.

    Raises:
        FileNotFoundError: The source does not exist.
        ValueError: A source file has an unsupported extension.
    """
    if not source.exists():
        raise FileNotFoundError(f'Source not found: {source}')

    if source.is_file():
        if source.suffix.lower() not in SUPPORTED_SUFFIXES:
            supported = ', '.join(sorted(SUPPORTED_SUFFIXES))
            raise ValueError(
                f'Unsupported source extension: {source.suffix}. '
                f'Expected one of: {supported}.',
            )

        return [source]

    iterator = source.rglob('*') if recursive else source.iterdir()
    return sorted(
        path for path in iterator
        if path.is_file() and path.suffix.lower() in SUPPORTED_SUFFIXES
    )


def resolve_single_target(
    source: pathlib.Path,
    output: pathlib.Path | None,
) -> pathlib.Path:
    """Resolves the output path for one source image.

    Args:
        source: Source image path.
        output: Optional output path or directory.

    Returns:
        Destination AVIF path.
    """
    if output is None:
        return source.with_suffix('.avif')

    if output.suffix.lower() == '.avif':
        return output

    return output / source.with_suffix('.avif').name


def create_conversion_plan(
    source: pathlib.Path,
    output: pathlib.Path | None,
    sources: list[pathlib.Path],
) -> list[tuple[pathlib.Path, pathlib.Path]]:
    """Maps source images to collision-free AVIF destinations.

    Args:
        source: Original source argument.
        output: Optional output argument.
        sources: Discovered source images.

    Returns:
        Source and destination path pairs.

    Raises:
        ValueError: Multiple source images resolve to one destination.
    """
    if source.is_file():
        return [(source, resolve_single_target(source, output))]

    output_root = output or source
    plan = [
        (
            image_path,
            output_root / image_path.relative_to(source).with_suffix('.avif'),
        )
        for image_path in sources
    ]
    destinations: dict[pathlib.Path, pathlib.Path] = {}

    for image_path, destination in plan:
        normalized_destination = destination.resolve()

        if normalized_destination in destinations:
            first_source = destinations[normalized_destination]
            raise ValueError(
                'Multiple source images resolve to the same AVIF: '
                f'{first_source}, {image_path} -> {destination}',
            )

        destinations[normalized_destination] = image_path

    return plan


def convert_image(
    source: pathlib.Path,
    destination: pathlib.Path,
    image_module: Any,
    image_ops_module: Any,
    quality: int,
    speed: int,
) -> None:
    """Converts one image through an atomic temporary output.

    Args:
        source: Source JPEG or PNG path.
        destination: Destination AVIF path.
        image_module: Pillow Image module.
        image_ops_module: Pillow ImageOps module.
        quality: AVIF quality setting.
        speed: AVIF encoder speed.

    Raises:
        ValueError: The source is an animated image.
    """
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_name(f'.{destination.name}.temporary')

    try:
        with image_module.open(source) as original:
            if getattr(original, 'n_frames', 1) > 1:
                raise ValueError(
                    f'Animated images are not supported: {source}',
                )

            color_profile = original.info.get('icc_profile')
            normalized = image_ops_module.exif_transpose(original)
            has_alpha = (
                'A' in normalized.getbands() or
                'transparency' in normalized.info
            )
            converted = normalized.convert('RGBA' if has_alpha else 'RGB')
            save_options = {
                'format': 'AVIF',
                'quality': quality,
                'speed': speed,
            }

            if color_profile:
                save_options['icc_profile'] = color_profile

            converted.save(temporary, **save_options)

        temporary.replace(destination)
    finally:
        temporary.unlink(missing_ok=True)


def main() -> int:
    """Runs the batch conversion and prints a deterministic summary.

    Returns:
        Zero when all conversions succeed, otherwise one.
    """
    arguments = parse_arguments()

    try:
        sources = discover_sources(arguments.source, arguments.recursive)
        plan = create_conversion_plan(
            arguments.source,
            arguments.output,
            sources,
        )
        image_module, image_ops_module = load_image_modules()
    except (FileNotFoundError, RuntimeError, ValueError) as error:
        print(f'Error: {error}', file=sys.stderr)
        return 1

    converted_count = 0
    skipped_count = 0
    failed_count = 0

    for source, destination in plan:
        if destination.exists() and not arguments.overwrite:
            skipped_count += 1
            print(f'Skipped existing: {destination}')
            continue

        try:
            convert_image(
                source,
                destination,
                image_module,
                image_ops_module,
                arguments.quality,
                arguments.speed,
            )
            converted_count += 1
            print(f'Converted: {source} -> {destination}')
        except (OSError, ValueError) as error:
            failed_count += 1
            print(f'Failed: {source}: {error}', file=sys.stderr)

    print(
        'Summary: '
        f'{converted_count} converted, '
        f'{skipped_count} skipped, '
        f'{failed_count} failed.',
    )
    return 1 if failed_count else 0


if __name__ == '__main__':
    raise SystemExit(main())
