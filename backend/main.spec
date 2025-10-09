# -*- mode: python ; coding: utf-8 -*-

from PyInstaller.utils.hooks import collect_all
chromadb_binaries, chromadb_datas, chromadb_hiddenimports = collect_all('chromadb')

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=chromadb_binaries,
    datas=chromadb_datas,
    hiddenimports=chromadb_hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='ai_assistant',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    icon='../assets/ai-logo.ico',
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None
)
