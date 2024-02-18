#!/bin/bash

set -ue

EMCC_PARAMS=(
  "-sEXPORTED_RUNTIME_METHODS="addFunction,emscriptenRegisterAudioObject,emscriptenGetAudioObject,wasmTable""
  '-sEXPORT_NAME=createTimeSignalModule'
  '-sINITIAL_MEMORY=65536'
  '-sALLOW_TABLE_GROWTH'
  '-sSTACK_SIZE=32768'
  '-sAUDIO_WORKLET'
  '-sWASM_WORKERS'
  '-sMALLOC=none'
  '-sEXPORT_ES6'
  '-sJS_MATH'
)

AWK_PROG='
BEGIN{
  line = -1
  ok = 1
}
{
  if ($0 ~ /timesignal.aw.js/) {
    sub("timesignal.aw.js", "wasm/timesignal.aw.js")
    ok = 1
  } else {
    if (line < 0 && $0 == "var wasmBinaryFile;")
      line = NR
    ok = line < 0 || ((NR != line + 1 && NR < line + 6) || NR > line + 9)
  }
  if (ok)
    print $0
}'

AWK_PROG_O3='
{
  sub("timesignal.aw.js", "wasm/timesignal.aw.js")
  sub(/var wasmBinaryFile;if\(Module\["locateFile"\]\){wasmBinaryFile="timesignal.wasm";if\(!isDataURI\(wasmBinaryFile\)\){wasmBinaryFile=locateFile\(wasmBinaryFile\)}}else{wasmBinaryFile=new URL\("timesignal.wasm",import.meta.url\).href}/,
      "var wasmBinaryFile=\"timesignal.wasm\";if(!isDataURI(wasmBinaryFile)){wasmBinaryFile=locateFile(wasmBinaryFile)}")
  print $0
}'

# Two problems prevent us from using timesignal.js as is.
#
# First, as of emsdk 3.1.51 (year end 2023), Emscripten generates broken
# JavaScript glue code for a module using the Wasm Audio Worklets API if
# compiled with -sEXPORT_ES6. The problem seems to be that URL() doesn't exist
# in AudioWorkletGlobalScope, and is fixed by turning this:
#
#   var wasmBinaryFile;
#   if (Module['locateFile']) {
#     wasmBinaryFile = 'timesignal.wasm';
#     if (!isDataURI(wasmBinaryFile)) {
#       wasmBinaryFile = locateFile(wasmBinaryFile);
#     }
#   } else {
#     // Use bundler-friendly `new URL(..., import.meta.url)` pattern; works in browsers too.
#     wasmBinaryFile = new URL('timesignal.wasm', import.meta.url).href;
#   }
#
# into this:
#
#   var wasmBinaryFile = 'timesignal.wasm';
#   if (!isDataURI(wasmBinaryFile)) {
#     wasmBinaryFile = locateFile(wasmBinaryFile);
#   }
#
# Second, Emscripten assumes that timesignal.aw.js will be moved to the server
# root, but we'll be moving it elsewhere. So we need to turn this:
#
#   audioWorklet.addModule('timesignal.aw.js').then(() => {
#
# into this:
#
#   audioWorklet.addModule('wasm/timesignal.aw.js').then(() => {
#
# We also have to account for the effects of -O3 on the generated .js files.
postprocess_timesignal_js() {
  local awk_prog=${AWK_PROG}

  for param in "${EMCC_PARAMS[@]}"; do
    if [ "$param" == "-O3" ]; then
      awk_prog=${AWK_PROG_O3}
      break
    fi
  done

  awk "${awk_prog}" timesignal.js > timesignal.js.out
  mv timesignal.js.out timesignal.js
}

# Append any user parameters.
for param in "$@"; do
  EMCC_PARAMS+=("${param}")
done

emcc timesignal.c -o timesignal.js "${EMCC_PARAMS[@]}"
postprocess_timesignal_js
mkdir -p ../../wasm
cp timesignal.aw.js timesignal.js timesignal.wasm ../../wasm
rm -f timesignal.aw.js timesignal.js timesignal.js.out timesignal.wasm timesignal.ww.js
