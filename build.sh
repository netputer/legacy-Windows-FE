#!/usr/bin/env sh
cd `dirname $0`
work_path="`pwd`"
PROJECT=$1;
TARGET=$2;
NLS=$3;

npm install
grunt build:$PROJECT:$TARGET:$NLS
rm -f ${work_path}/dist/build.txt
