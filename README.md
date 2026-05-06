# Service Container Entrypoint Demo

> Demonstrating the new `command` and `entrypoint` keys for GitHub Actions service containers (April 2026).

## The Problem

Before April 2026, you **could not** pass custom flags to a service container. If you needed MySQL to run with `--sql_mode=STRICT_TRANS_TABLES` or `--max_allowed_packet=512M`, your options were:

1. Build and maintain a custom Docker image with baked-in flags
2. Stop the Actions-managed container and restart it manually in a step
3. Configure the service at runtime via SQL after it starts (not always possible)

All of these are fragile, verbose, and defeat the purpose of declarative service containers.

## The Solution

GitHub Actions now supports `command` and `entrypoint` keys on service containers. The naming and behavior match Docker Compose.

### Before (68 lines of workaround)

```yaml
services:
  mysql:
    image: mysql:8
    env:
      MYSQL_ROOT_PASSWORD: test
    ports:
      - 3306:3306
    # No way to pass --sql_mode or --max_allowed_packet here!

steps:
  # Workaround: build a custom image and restart MySQL manually
  - name: Build custom MySQL image
    run: docker build -t mysql-custom -f .docker/Dockerfile.mysql-custom .docker/

  - name: Restart MySQL with custom flags
    run: |
      docker stop $(docker ps -q --filter "ancestor=mysql:8") || true
      docker run -d --name mysql-custom -e MYSQL_ROOT_PASSWORD=test \
        -p 3307:3306 mysql-custom
      # ... wait for it to be ready ...
```

### After (4 lines)

```yaml
services:
  mysql:
    image: mysql:8
    command: --sql_mode=STRICT_TRANS_TABLES --max_allowed_packet=512M
    env:
      MYSQL_ROOT_PASSWORD: test
    ports:
      - 3306:3306
```

That's it. One line. No custom Dockerfile. No manual container orchestration.

## What This Demo Includes

| File | Purpose |
|------|---------|
| `.github/workflows/before.yml` | The old workaround approach |
| `.github/workflows/after.yml` | The new `command` key approach |
| `.docker/Dockerfile.mysql-custom` | Custom image needed for the workaround |
| `.docker/entrypoint.sh` | Custom entrypoint script for the workaround |
| `src/check-mysql-config.js` | Connects to MySQL and verifies configuration |
| `tests/mysql-config.test.js` | Integration tests asserting custom flags took effect |

## Running the Demo

1. **Fork this repository** to your own GitHub account
2. Go to the **Actions** tab
3. Run either workflow manually via "workflow_dispatch":
   - **"Before: Custom Dockerfile Workaround"** shows the old painful approach
   - **"After: Service Container Command Key"** shows the clean new approach
4. Both workflows run the same integration tests the "after" workflow is just simpler

## Key Takeaways

- `command:` overrides the image's `CMD` use it to pass flags (most common case)
- `entrypoint:` overrides the image's `ENTRYPOINT` use it to swap the binary entirely
- You can combine both, just like Docker Compose
- No more maintaining wrapper Dockerfiles for simple flag changes

## References

- [Changelog: Customizing entrypoints for service containers](https://github.blog/changelog/2026-04-02-github-actions-early-april-2026-updates/)
- [Docs: Use Docker service containers](https://docs.github.com/en/actions/tutorials/use-containerized-services/use-docker-service-containers)
- [Workflow syntax: services.command](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idservicesservice_idcommand)
