#!/bin/sh

if [ $# -lt 2 ]
then
	echo "Usage: download-imagenet.sh <synsetId> <directory>"
	exit
fi

if [ ! -d "$2" ]; then
	echo "Directory $2 doesn't exist."
	exit
fi

curr=`pwd`

cd $2

wget -nv -O - http://www.image-net.org/api/text/imagenet.synset.geturls?wnid=$1 | \
tr -d '\r' | xargs -n 1 -P 16 wget -nv --timeout=10 --tries=1

echo "Cleaning up non JPG files"

a=1
for i in *; do
	new=$(printf "%04d.jpg" ${a}) #04 pad to length of 4
	mv "$i" "$new"
	a=$((a+1))
done

file * | grep -v "JPEG" | grep -o "^[^:]*" | xargs rm -f

echo "Back to $curr"

cd $curr
