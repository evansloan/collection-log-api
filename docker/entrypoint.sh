#!/bin/sh

CMD_FLAGS="--noTimeout --stage=${STAGE} --host=${HOST} --httpPort=${PORT}"

if [ $USE_CHILD_PROCESSES ]; then
  echo "Child processes enabled..."
  CMD_FLAGS="${CMD_FLAGS} --useChildProcesses";
fi

if [ $ALLOW_CACHE ]; then
  echo "Caching enabled..."
  CMD_FLAGS="${CMD_FLAGS} --allowCache";
fi

yarn run serverless offline start $CMD_FLAGS
