#!/bin/bash

# Automated File Organizer for KWD Project
# This script automatically organizes files based on rules.json

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RULES_FILE="$SCRIPT_DIR/rules.json"
LOG_FILE="$SCRIPT_DIR/organize.log"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
}

# Check if jq is available for JSON parsing
if ! command -v jq &> /dev/null; then
    log_error "jq is not installed. Using basic organization..."
    USE_BASIC=true
else
    USE_BASIC=false
fi

# Create necessary directories
create_dirs() {
    mkdir -p "$PROJECT_ROOT/docs/auto-organized/markdown"
    mkdir -p "$PROJECT_ROOT/docs/archive/auto-backups"
    mkdir -p "$PROJECT_ROOT/docs/archive/temp"
    mkdir -p "$PROJECT_ROOT/data-content/raw-data"
}

# Basic organization without jq
basic_organize() {
    log "Starting basic file organization..."
    
    cd "$PROJECT_ROOT" || exit 1
    
    # Move markdown files (except protected ones)
    find . -maxdepth 1 -name "*.md" ! -name "README.md" ! -name "SECURITY.md" ! -name "PROJECT_STRUCTURE.md" -type f | while read -r file; do
        if [ -f "$file" ]; then
            mv "$file" "docs/auto-organized/markdown/"
            log_success "Moved: $file → docs/auto-organized/markdown/"
        fi
    done
    
    # Move shell scripts
    find . -maxdepth 1 -name "*.sh" -type f | while read -r file; do
        if [ -f "$file" ]; then
            mv "$file" "docs/scripts/"
            log_success "Moved: $file → docs/scripts/"
        fi
    done
    
    # Move Python scripts (except protected ones)
    find . -maxdepth 1 -name "*.py" -type f | while read -r file; do
        if [ -f "$file" ]; then
            mv "$file" "docs/scripts/"
            log_success "Moved: $file → docs/scripts/"
        fi
    done
    
    # Move backup files
    find . -maxdepth 1 -name "*backup*" -o -name "*_backup*" | while read -r file; do
        if [ -f "$file" ]; then
            mv "$file" "docs/archive/auto-backups/"
            log_success "Moved: $file → docs/archive/auto-backups/"
        fi
    done
    
    # Move txt files (except in data-content)
    find . -maxdepth 1 -name "*.txt" -type f | while read -r file; do
        if [ -f "$file" ]; then
            mv "$file" "data-content/raw-data/"
            log_success "Moved: $file → data-content/raw-data/"
        fi
    done
    
    # Move business documents
    find . -maxdepth 1 \( -name "*.docx" -o -name "*.pdf" -o -name "*.xlsx" \) -type f | while read -r file; do
        if [ -f "$file" ]; then
            mv "$file" "docs/business-plans/"
            log_success "Moved: $file → docs/business-plans/"
        fi
    done
    
    # Clean data-content folder
    if [ -d "data-content" ]; then
        find data-content -maxdepth 1 -name "*.py" -type f | while read -r file; do
            if [ -f "$file" ]; then
                mv "$file" "docs/scripts/"
                log_success "Moved: $file → docs/scripts/"
            fi
        done
        
        find data-content -maxdepth 1 -name "*.json" ! -name "package*.json" -type f | while read -r file; do
            if [ -f "$file" ]; then
                mv "$file" "data-content/raw-data/"
                log_success "Moved: $file → data-content/raw-data/"
            fi
        done
    fi
}

# Main execution
main() {
    log "=== File Organization Started ==="
    
    create_dirs
    basic_organize
    
    log "=== File Organization Completed ==="
    echo ""
    echo "Summary:"
    echo "  Log file: $LOG_FILE"
    echo "  Organized folders:"
    echo "    - docs/auto-organized/markdown/"
    echo "    - docs/scripts/"
    echo "    - docs/archive/auto-backups/"
    echo "    - data-content/raw-data/"
    echo ""
}

# Run main function
main
