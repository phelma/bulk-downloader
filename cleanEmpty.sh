echo "Cleaning up $(find ./out -type f -empty | wc -l) empty files"
find ./out -type f -empty -exec rm {} \;