#!/bin/bash
NUMBER=0
while read FILENAME URL
do
    FOLDER="${FILENAME:0:9}"
    #echo "FILENAME = ${FILENAME}"
    #echo "FOLDER = ${FOLDER}"
    mkdir -p "out/${FOLDER}"
    wget --no-clobber --output-document="./out/${FOLDER}/${FILENAME}.JPEG" "$URL" --user-agent="Cyberdog/2.0 (Macintosh; 68k)" --no-verbose --timeout=2 --tries=1 &   # So `wget` runs in background
    NUMBER=$((NUMBER + 1))
    if [ $NUMBER -gt 25 ]
    then
        wait
        NUMBER=0
    fi
done
wait

echo "Cleaning up $(find ./out -type f -empty | wc -l) empty files"
find ./out -type f -empty -exec rm {} \;