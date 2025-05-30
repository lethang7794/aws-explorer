#!/usr/bin/env bash

rm -rf public/aws/
mkdir -p public/aws
cp -r aws-icons-transform-without-prefix/* public/aws/

rm -rf aws-icons-extract
rm -rf aws-icons-transform
rm -rf aws-icons-transform-without-prefix
rm -rf aws-icons-transform-optimized
