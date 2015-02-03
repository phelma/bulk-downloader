#!/usr/bin/env bash
cd out
FILES=./*.JPEG
for FILENAME in $FILES
do
	FOLDER="${FILENAME:0:11}"
	FILEPATH="${FOLDER}/${FILENAME}"
	echo "moving $FILENAME => ${FILEPATH}"
	mkdir -p "${FOLDER}"
	mv "${FILENAME}" "${FILEPATH}"
done