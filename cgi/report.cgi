#!/bin/bash

# we need to write the content type header first
# before any content
# followed by an empty line
echo "Content-type: text/html"
echo ""

# filter out the log lines we want that contain action=track
grep action=track ../log/access.log > action.log

# put the last 24+ hours worth into a json file
# but just keep the date strings
# so we can parse them into date objects for the graph
tail -n 1440 action.log | cut -d "[" -f 2 | cut -d "]" -f 1 | sed 's/:/ /' | sed 's/\//-/g' | jq -R -s -c 'split("\n") | map(select(. != ""))' > 1440.json

# set environment variables
export CURRENT_DATETIME=$(date +"%A %d %b %Y - %T");
export LAST_TRACK=$(tail -n 1 action.log);
export LAST_IP=$(tail -n 1 action.log | cut -d " " -f 1);
export LAST_ONLINE=$(tail -n 1 action.log | cut -d "[" -f 2 | cut -d "]" -f 1 | cut -d " " -f 1  | sed 's/:/ /' | sed 's/\// /g');
export LAST_DATE=$(cut -d " " -f 1-3 <<< $LAST_ONLINE);
export LAST_TIME=$(cut -d " " -f 4 <<< $LAST_ONLINE);

# substitute environment variables into the template file
envsubst < template.html

exit 0