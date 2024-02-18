#!/bin/bash

set -ue

EMCC_PARAMS=(
  '-sEXPORT_NAME=createEditDistanceModule'
  '-sINITIAL_MEMORY=65536'
  '-sSTACK_SIZE=40960'
  '-sMALLOC=none'
  '-sEXPORT_ES6'
  '-O3'
)

# Append any user parameters.
for param in "$@"; do
  EMCC_PARAMS+=("${param}")
done

emcc editdistance.c -o editdistance.js "${EMCC_PARAMS[@]}" &&
  mkdir -p ../../wasm &&
  cp editdistance.js editdistance.wasm ../../wasm &&
  rm -f editdistance.js editdistance.wasm
