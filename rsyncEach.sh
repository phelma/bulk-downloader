#!/usr/bin/env bash

FROM=$1/*/
TO=$2
echo "FROM = $FROM"
for f in $FROM
do
  echo " Copying $f"
  DIR=`basename $f`
  echo "mkdir -p $TO/$DIR"
  mkdir -p $TO/$DIR
  echo "rsync -r $f $TO/$DIR/"
  rsync -r $f $TO/$DIR/
done
