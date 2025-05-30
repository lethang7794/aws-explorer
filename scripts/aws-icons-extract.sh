#!/bin/bash

# Define constants
TARGET_DIR="aws-icons-extract"

DOWNLOAD_URL="https://d1.awsstatic.com/webteam/architecture-icons/q1-2025/Asset-Package_02072025.dee42cd0a6eaacc3da1ad9519579357fb546f803.zip"
ZIP_FILE="aws-architecture-icons.zip"

# Clean up any previous artifacts
rm -rf "$ZIP_FILE" "$TARGET_DIR"

# Download the file with error handling
if command -v curl &>/dev/null; then
  echo "Downloading using curl..."
  if ! curl -L -k "$DOWNLOAD_URL" -o "$ZIP_FILE"; then
    echo "Error: Download failed with curl" >&2
    exit 1
  fi
elif command -v wget &>/dev/null; then
  echo "Downloading using wget..."
  if ! wget --no-check-certificate "$DOWNLOAD_URL" -O "$ZIP_FILE"; then
    echo "Error: Download failed with wget" >&2
    exit 1
  fi
else
  echo "Error: Neither curl nor wget found. Install either to proceed." >&2
  exit 1
fi

# Verify zip file downloaded
if [ ! -f "$ZIP_FILE" ]; then
  echo "Error: Downloaded file not found" >&2
  exit 1
fi

# Create target directory
mkdir -p "$TARGET_DIR"

# Extract the archive
echo "Extracting files..."
if ! unzip -q "$ZIP_FILE" -d "$TARGET_DIR"; then
  echo "Error: Extraction failed" >&2
  exit 1
fi

# Clean macOS artifacts
echo "Cleaning macOS artifacts..."
# Remove __MACOSX directory if exists
find "$TARGET_DIR" -type d -name "__MACOSX" -exec rm -rf {} + 2>/dev/null
# Remove all .DS_Store files
find "$TARGET_DIR" -type f -name ".DS_Store" -delete 2>/dev/null

# Verify extraction success
if [ ! -d "$TARGET_DIR" ] || [ -z "$(ls -A "$TARGET_DIR")" ]; then
  echo "Error: Extraction produced empty directory" >&2
  exit 1
fi

echo "Successfully downloaded and extracted AWS Architecture Icons"
echo "Files are in: $TARGET_DIR"
