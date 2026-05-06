#!/bin/bash
# Custom entrypoint that passes our desired flags to MySQL.
# This was the workaround BEFORE the entrypoint/command feature existed.
exec docker-entrypoint.sh mysqld \
  --sql_mode=STRICT_TRANS_TABLES \
  --max_allowed_packet=512M
