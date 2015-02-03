#!/usr/bin/env bash
cd out
FILES=./*.JPEG.
for FILENAME in $FILES
do
	echo "moving ${FILENAME} => ${FILENAME:0:(-1)}"
	# mv "${FILENAME}" "${FILENAME:0:(-1)}"
done