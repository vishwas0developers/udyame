# Implementation Plan - Database Port Isolation

This plan addresses the database connection errors caused by port conflicts with other PostgreSQL instances. As discussed, we will map the Docker container's internal Postgres port (5432) to a dedicated external host port (**5013**) to ensure complete isolation for the Udyame AI project.

## Proposed Changes

### [MODIFY] [docker-compose.yml](file:///D:/All_Project/udyame/Back_end/docker-compose.yml)
Update the port mapping to avoid conflicts with other local Postgres instances or containers.
- **Port Mapping**: Change `ports:` from `"5432:5432"` to `"5013:5432"`.
- This ensures the host accesses the database via `5013`, while PostgreSQL internally still operates on its default `5432`.

### [MODIFY] [.env](file:///D:/All_Project/udyame/Back_end/.env)
Update the application's environment configuration to connect to the new external port.
- **DATABASE_URL**: Update the connection string from `...127.0.0.1:5432/...` to `...127.0.0.1:5013/...`.

### [MODIFY] [managed_server.py](file:///D:/All_Project/udyame/Back_end/managed_server.py)
Update the self-healing watchdog to monitor the correct, isolated port.
- Change all references from port `5432` to **`5013`** in the `resolve_db_conflicts` method.
- Update the `netstat` and `tasklist` checks to look for conflicts on port `5013`.

## Verification Plan

### Automated/Manual Verification
1.  **Restart System**: Run `run.bat` to rebuild the docker container with the new configuration.
2.  **Verify Port Allocation**: Check `docker ps` to ensure the `udyame_db` container correctly displays `0.0.0.0:5013->5432/tcp`.
3.  **Test Connection**: Confirm the backend successfully connects to the database via port 5013, eliminating the previous `OperationalError`.
