# -*- coding: utf-8 -*-
"""从战雷最新客户端 lang.vromfs.bin (优先) 或本地 lang/ 目录只读读取官方 CSV。"""

from __future__ import annotations

import csv
import io
import os
import struct
from functools import lru_cache
from pathlib import Path
from typing import Iterator

csv.field_size_limit(10_000_000)

DEFAULT_VROMFS = Path(r"E:\SteamLibrary\steamapps\common\War Thunder\lang.vromfs.bin")
DEFAULT_LANG_DIR = Path(r"E:\SteamLibrary\steamapps\common\War Thunder\lang")

_K_HEAD = struct.pack("<4I", 0xAA55AA55, 0xF00FF00F, 0xAA55AA55, 0x12481248)
_K_TAIL = struct.pack("<4I", 0x12481248, 0xAA55AA55, 0xF00FF00F, 0xAA55AA55)


@lru_cache(maxsize=1)
def _unpack_vromfs(vromfs_path: str) -> dict[str, bytes]:
    p = Path(vromfs_path)
    if not p.exists():
        return {}
    import zstandard

    data = p.read_bytes()
    magic, _platform, orig_size, packed_info = struct.unpack("<4s4sII", data[:16])
    if magic == b"VRFx":
        ext_size, _flags, _version = struct.unpack("<HHI", data[16:24])
        body_offset = 16 + ext_size
    else:
        body_offset = 16
    packed_size = packed_info & 0x03FFFFFF
    body = bytearray(data[body_offset : body_offset + packed_size])

    for i in range(min(16, len(body))):
        body[i] ^= _K_HEAD[i]
    if packed_size >= 32:
        aligned_end = packed_size & ~3
        for i in range(16):
            body[aligned_end - 16 + i] ^= _K_TAIL[i]

    raw = zstandard.ZstdDecompressor().decompress(bytes(body), max_output_size=orig_size + 65536)
    vals = struct.unpack("<8I", raw[:32])
    names_off, names_cnt, data_off = vals[0], vals[1], vals[4]

    files: dict[str, bytes] = {}
    for i in range(names_cnt):
        noff = struct.unpack("<Q", raw[names_off + i * 8 : names_off + (i + 1) * 8])[0]
        end = raw.index(b"\x00", noff)
        fname = raw[noff:end].decode("utf-8", errors="replace")
        doff, dsz = struct.unpack("<II", raw[data_off + i * 16 : data_off + i * 16 + 8])
        files[fname] = raw[doff : doff + dsz]
    return files


def clean_text(s: str) -> str:
    if not s:
        return ""
    return (
        s.replace("\\t", "")
        .replace("\t", "")
        .replace("\\r", "")
        .replace("\r", "")
        .replace("\u200b", "")
        .replace("\u00a0", " ")
        .strip()
    )


def load_csv(
    filename: str,
    vromfs_path: Path = DEFAULT_VROMFS,
    fallback_dir: Path = DEFAULT_LANG_DIR,
) -> tuple[list[str], int, list[list[str]]]:
    """读取指定 CSV（如 'units.csv'），返回 (header, zh_col_idx, data_rows)。"""
    text: str | None = None
    if vromfs_path.exists():
        files = _unpack_vromfs(str(vromfs_path))
        for candidate in (f"lang/{filename}", filename):
            if candidate in files:
                text = files[candidate].decode("utf-8-sig", errors="replace")
                break

    if text is None:
        local_csv = fallback_dir / filename
        if not local_csv.exists():
            return [], -1, []
        text = local_csv.read_text(encoding="utf-8-sig", errors="replace")

    rows = list(csv.reader(io.StringIO(text), delimiter=";"))
    if not rows:
        return [], -1, []

    hdr = rows[0]
    zh_idx = next(
        (i for i, h in enumerate(hdr) if "Chinese" in h and "Traditional" not in h),
        10,
    )
    return hdr, zh_idx, [r for r in rows[1:] if r]
