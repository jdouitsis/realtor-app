# SOP: Development Port Configuration

How to change development ports for local services (PostgreSQL, MinIO, Vite, Server).

## Port Reference

| Service       | Port | Purpose                   |
| ------------- | ---- | ------------------------- |
| Server        | 3100 | Express + tRPC API        |
| Vite          | 5177 | Web dev server            |
| PostgreSQL    | 5444 | Database (mapped to 5432) |
| MinIO API     | 9100 | S3-compatible storage API |
| MinIO Console | 9101 | MinIO web UI              |

## Files to Update

When changing a port, update **all** relevant files listed below.

### Server Port

| File           | Variable/Setting | Example                              |
| -------------- | ---------------- | ------------------------------------ |
| `.env.example` | `PORT`           | `PORT=3100`                          |
| `.env`         | `PORT`           | `PORT=3100`                          |
| `.env.example` | `VITE_API_URL`   | `VITE_API_URL=http://localhost:3100` |
| `.env`         | `VITE_API_URL`   | `VITE_API_URL=http://localhost:3100` |

### Vite Dev Server Port

| File                      | Variable/Setting | Example                                        |
| ------------------------- | ---------------- | ---------------------------------------------- |
| `.env.example`            | `WEB_URL`        | `WEB_URL=http://localhost:5177`                |
| `.env`                    | `WEB_URL`        | `WEB_URL=http://localhost:5177`                |
| `apps/web/vite.config.ts` | `server.port`    | `port: 5177`                                   |
| `apps/web/vite.config.ts` | `preview.port`   | `port: parseInt(process.env.PORT \|\| "5177")` |

### PostgreSQL Port

| File                 | Variable/Setting | Example                                                  |
| -------------------- | ---------------- | -------------------------------------------------------- |
| `.env.example`       | `DATABASE_URL`   | `postgresql://postgres:postgres@localhost:5444/postgres` |
| `.env`               | `DATABASE_URL`   | `postgresql://postgres:postgres@localhost:5444/postgres` |
| `docker-compose.yml` | `postgres.ports` | `- "5444:5432"`                                          |

### MinIO Ports

| File                 | Variable/Setting | Example                   |
| -------------------- | ---------------- | ------------------------- |
| `docker-compose.yml` | `minio.ports[0]` | `- "9100:9000"` (API)     |
| `docker-compose.yml` | `minio.ports[1]` | `- "9101:9001"` (Console) |

**Note:** MinIO's internal ports (9000, 9001) stay the same. Only the host-side mappings change.

## Workflow

### Changing a Port

1. Identify all files that reference the port (see tables above)
2. Update each file
3. Restart affected services:
   - Docker services: `docker compose down && docker compose up -d`
   - Vite: restart `pnpm dev`
   - Server: restart `pnpm dev` (if running separately)

### Example: Change Vite from 5177 to 5200

1. Update `.env.example`:

   ```bash
   WEB_URL=http://localhost:5200
   ```

2. Update `.env`:

   ```bash
   WEB_URL=http://localhost:5200
   ```

3. Update `apps/web/vite.config.ts`:

   ```typescript
   server: {
     port: 5200,
   },
   preview: {
     port: parseInt(process.env.PORT || "5200"),
   },
   ```

4. Restart dev server

## Avoiding Port Conflicts

Common port conflicts and alternatives:

| Service    | Default | Conflict With       | Alternative |
| ---------- | ------- | ------------------- | ----------- |
| PostgreSQL | 5432    | Local Postgres      | 5444        |
| MinIO API  | 9000    | PHP-FPM, other apps | 9100        |
| Vite       | 5173    | Other Vite projects | 5177        |

## Troubleshooting

### "Port already in use" error

Find what's using the port:

```bash
lsof -i :5177
```

Kill the process or choose a different port.

### Database connection refused after port change

Ensure both files are updated:

1. `docker-compose.yml` host port mapping
2. `.env` DATABASE_URL port

Then restart Docker:

```bash
docker compose down && docker compose up -d
```

### Vite still using old port

The port in `vite.config.ts` takes precedence over environment variables for the dev server. Update the config file directly.
