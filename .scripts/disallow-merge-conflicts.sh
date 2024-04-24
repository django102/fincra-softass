#!/bin/bash

echo "\nRunning pre-commit checks..."

git diff --cached --name-status | while read st file; do
        # skip deleted files
        if [ "$st" == 'D' ]; then continue; fi

        if grep -Eq "^(>>>>>>>|=======|<<<<<<<)" "$file"; then
            echo "Conflict detected in $file, aborting commit."
            exit 1
        fi
done