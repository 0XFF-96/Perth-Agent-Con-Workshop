#!/bin/bash
cd /workspace
echo "=== Current branch ==="
git branch --show-current
echo "=== Git log (recent) ==="
git log --oneline -10
echo "=== Remote branches ==="
git branch -a
echo "=== All refs ==="
git log --all --oneline | head -20
echo "=== Status ==="
git status
