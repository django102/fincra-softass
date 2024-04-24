#!/bin/sh

echo "\nRunning pre-push checks...\n"

# these are used to color text
# RED to start coloring all text RED and NC to cancel coloring
RED='\033[0;31m'
NC='\033[0m'

# check file changes between local and upstream that have syntax errors
echo "${RED}"
if git rev-parse @{u} > /dev/null 2>&1
then
  # we are not on a branch, just check all js files for syntax errors
  git diff-tree  --no-commit-id --name-only -r @{u}.. | grep '.js$' | xargs ls -d 2>/dev/null | xargs -P 10 -n1 node --check
else
  # get the branch being pushed
  branch_name=$(git symbolic-ref -q HEAD)
  branch_name=${branch_name##refs/heads/}
  # ensure that none of the JS files changed when compared to master have a syntax error
  git diff-tree  --no-commit-id --name-only -r "main..$branch_name" | grep '.js$' | xargs ls -d 2>/dev/null | xargs -P 10 -n1 node --check
fi
# save the status of our git diff-tree check
syntaxErrorCheckStatus=$?
echo "${NC}"

exit $syntaxErrorCheckStatus