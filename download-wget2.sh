#!/bin/bash
NUMBER=0
while read FILENAME URL
do
    wget --no-clobber --output-document="./out/$FILENAME" "$URL" --user-agent="Cyberdog/2.0 (Macintosh; 68k)" --no-verbose --timeout=2 --tries=1 &   # So `wget` runs in background
    NUMBER=$((NUMBER + 1))
    if [ $NUMBER -gt 25 ]
    then
        wait   # wait all background process to finish
        NUMBER=0
    fi
done < head10k.txt
wait

echo "Cleaning up $(find . -type f -empty | wc -l) empty files"
find ./out -type f -empty -exec rm {} \;