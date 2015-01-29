#!/bin/bash
NUMBER=0
while read FILENAME URL
do
    wget -nc -O "./out/$FILENAME" "$URL" --user-agent="Cyberdog/2.0 (Macintosh; 68k)" -nv --timeout=2 --tries=1 --read-timeout=0.5 &   # So `wget` runs in background
    NUMBER=$((NUMBER + 1))
    if [ $NUMBER -gt 20 ]
    then
        wait   # wait all background process to finish
        NUMBER=0
    fi
done < head100k.txt
wait

echo "Cleaning up non JPG files"
curr=`pwd`

a=1
for i in *; do
    new=$(printf "%04d.jpg" ${a}) #04 pad to length of 4
    mv "$i" "$new"
    a=$((a+1))
done

file * | grep -v "JPEG" | grep -o "^[^:]*" | xargs rm -f

echo "Back to $curr"

cd $curr