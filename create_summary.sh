#!/bin/bash

# create_summary.sh - Erstellt eine strukturierte Code-Zusammenfassung

OUTPUT_FILE="CODE_SUMMARY.md"

echo "# RealLifeOS - Code Zusammenfassung" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "Generiert am: $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Verzeichnisstruktur
echo "## 📁 Verzeichnisstruktur" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
tree -L 3 -I 'node_modules' . >> "$OUTPUT_FILE" 2>/dev/null || find . -not -path '*/node_modules*' -not -path '*/.git*' -type f -o -type d | head -50 >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Wichtige Konfigurationsdateien
echo "## ⚙️ Konfigurationsdateien" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

for file in package.json vite.config.js eslint.config.js; do
  if [ -f "$file" ]; then
    echo "### $file" >> "$OUTPUT_FILE"
    echo '```json' >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  fi
done

# Komponenten
echo "## 🧩 React Komponenten (src/components/)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

for file in src/components/*.jsx; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    echo "### $filename" >> "$OUTPUT_FILE"
    echo '```jsx' >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  fi
done

# Hooks
echo "## 🪝 Custom Hooks (src/hooks/)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

for file in src/hooks/*.js; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    echo "### $filename" >> "$OUTPUT_FILE"
    echo '```javascript' >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  fi
done

# Engine
echo "## ⚙️ Engine (src/engine/)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

for file in src/engine/*.js; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    echo "### $filename" >> "$OUTPUT_FILE"
    echo '```javascript' >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  fi
done

# Utilities
echo "## 🛠️ Utilities (src/utils/)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

for file in src/utils/*.js; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    echo "### $filename" >> "$OUTPUT_FILE"
    echo '```javascript' >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  fi
done

# Daten & Konstanten
echo "## 📊 Daten & Konstanten (src/data/)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

for file in src/data/*.{js,json}; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    ext="${file##*.}"
    echo "### $filename" >> "$OUTPUT_FILE"
    echo "\`\`\`$ext" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  fi
done

# Haupt-Dateien
echo "## 📄 Haupt-Dateien" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

for file in src/main.jsx src/App.jsx src/index.css; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    echo "### $filename" >> "$OUTPUT_FILE"
    if [[ "$file" == *.jsx ]]; then
      echo '```jsx' >> "$OUTPUT_FILE"
    elif [[ "$file" == *.css ]]; then
      echo '```css' >> "$OUTPUT_FILE"
    else
      echo '```javascript' >> "$OUTPUT_FILE"
    fi
    cat "$file" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  fi
done

# README
if [ -f "README.md" ]; then
  echo "## 📋 README" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  cat README.md >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
fi

echo "✅ Code-Zusammenfassung erstellt: $OUTPUT_FILE"
echo "📊 Dateigröße: $(du -h "$OUTPUT_FILE" | cut -f1)"
