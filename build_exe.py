#!/usr/bin/env python3
"""
Build script for creating executable files for Cipher Tools.
This script uses PyInstaller to build standalone executables.
"""

import os
import sys
import subprocess
import platform


def build_executables():
    """Build executable files for the cipher tools."""
    print("Building Cipher Tool executables...")
    
    # Determine platform-specific settings
    is_windows = platform.system() == "Windows"
    output_dir = "dist"
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Build the command-line tool
    cli_args = [
        "pyinstaller",
        "--onefile",
        "--name", "cipher_tool",
        "cipher_tool.py"
    ]
    print("Building command-line tool...")
    subprocess.run(cli_args, check=True)
    
    # Build the GUI tool
    gui_args = [
        "pyinstaller",
        "--onefile",
        "--windowed",
        "--name", "cipher_gui",
        "cipher_gui.py"
    ]
    print("Building GUI tool...")
    subprocess.run(gui_args, check=True)
    
    # Create launcher script/batch file for Windows
    if is_windows:
        print("Creating Windows launcher...")
        with open("dist/run_cipher_app.bat", "w") as f:
            f.write('@echo off\r\n')
            f.write('echo Cipher Tools Application\r\n')
            f.write('echo 1. Run Command Line Interface\r\n')
            f.write('echo 2. Run Graphical User Interface\r\n')
            f.write('set /p choice="Enter your choice (1 or 2): "\r\n')
            f.write('if "%choice%"=="1" (\r\n')
            f.write('    start cipher_tool.exe\r\n')
            f.write(') else if "%choice%"=="2" (\r\n')
            f.write('    start cipher_gui.exe\r\n')
            f.write(') else (\r\n')
            f.write('    echo Invalid choice\r\n')
            f.write('    pause\r\n')
            f.write(')\r\n')
    
    print("Build completed successfully!")
    return 0


if __name__ == "__main__":
    sys.exit(build_executables())
