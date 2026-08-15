#!/bin/sh
set -e

mkdir -p "$(dirname "${SQLITE_PATH:-/app/data/db.sqlite3}")"

python manage.py migrate --noinput

if [ "${RUN_SEED:-1}" = "1" ]; then
  python manage.py seed_shelters
fi

exec "$@"
