# Test Commands

Run server build must not have any errors:

```bash
cd server && npm run build
```

Run client build must not have any errors:

```bash
cd client && npm run build
```

Run the docker compose so that it at least can start without errors:

```bash
docker compose -f docker-compose.dev.yml up
```