#!/usr/bin/env bash

# This script is used to transform the AWS icons after they have been downloaded.
svgo --config svgo.config.cjs -f aws-icons-transform/ -o aws-icons-transform-optimized/
svgo --config svgo.config.cjs -f aws-icons-transform-without-prefix/ -o aws-icons-transform-without-prefix/
