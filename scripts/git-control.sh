#!/bin/bash

# ANSI colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${MAGENTA}   🚀 KWD Neo-Brutalist Git Controller  ${NC}"
echo -e "${YELLOW}========================================${NC}"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${CYAN}Current Branch:${NC} ${GREEN}${CURRENT_BRANCH}${NC}"
echo ""

# Function to ask confirmation
ask_yes_no() {
    local prompt=$1
    local choice
    while true; do
        read -p "$prompt (y/n): " choice
        case "$choice" in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo -e "${RED}Please answer yes or no.${NC}";;
        esac
    done
}

# 1. Fetch
if ask_yes_no "1. Fetch latest changes from remote?"; then
    echo -e "${BLUE}Running: git fetch...${NC}"
    git fetch
    echo -e "${GREEN}Fetch completed!${NC}"
else
    echo -e "${RED}Skipped Fetch.${NC}"
fi
echo ""

# 2. Pull
if ask_yes_no "2. Pull latest changes from remote?"; then
    echo -e "${BLUE}Running: git pull origin $CURRENT_BRANCH...${NC}"
    git pull origin "$CURRENT_BRANCH"
    echo -e "${GREEN}Pull completed!${NC}"
else
    echo -e "${RED}Skipped Pull.${NC}"
fi
echo ""

# Show current status
echo -e "${YELLOW}--- Current Git Status ---${NC}"
git status -s
echo -e "${YELLOW}--------------------------${NC}"
echo ""

# Check if there are changes to commit
if [[ -n $(git status --porcelain) ]]; then
    # 3. Commit
    if ask_yes_no "3. Would you like to commit these changes?"; then
        read -p "Enter commit message: " commit_message
        if [[ -z "$commit_message" ]]; then
            echo -e "${RED}Commit message cannot be empty. Staging skipped.${NC}"
        else
            echo -e "${BLUE}Running: git add . && git commit...${NC}"
            git add .
            git commit -m "$commit_message"
            echo -e "${GREEN}Commit successful!${NC}"
        fi
    else
        echo -e "${RED}Skipped Commit.${NC}"
    fi
else
    echo -e "${GREEN}No changes to commit (clean working directory).${NC}"
fi
echo ""

# Check if there are commits to push
# Compare local branch to remote
git log origin/"$CURRENT_BRANCH".."$CURRENT_BRANCH" --oneline > /dev/null 2>&1
HAS_UNPUSHED=$?

if [ $HAS_UNPUSHED -eq 0 ] && [[ -n $(git log origin/"$CURRENT_BRANCH".."$CURRENT_BRANCH" --oneline) ]]; then
    echo -e "${YELLOW}Unpushed commits:${NC}"
    git log origin/"$CURRENT_BRANCH".."$CURRENT_BRANCH" --oneline
    echo ""
    # 4. Push
    if ask_yes_no "4. Push changes to remote?"; then
        echo -e "${BLUE}Running: git push origin $CURRENT_BRANCH...${NC}"
        git push origin "$CURRENT_BRANCH"
        echo -e "${GREEN}Push completed!${NC}"
    else
        echo -e "${RED}Skipped Push.${NC}"
    fi
else
    # If no unpushed commits but user still wants to force push or check
    if ask_yes_no "4. No unpushed commits detected. Push anyway?"; then
        echo -e "${BLUE}Running: git push origin $CURRENT_BRANCH...${NC}"
        git push origin "$CURRENT_BRANCH"
        echo -e "${GREEN}Push completed!${NC}"
    else
        echo -e "${RED}Skipped Push.${NC}"
    fi
fi

echo ""
echo -e "${GREEN}Done!${NC}"
