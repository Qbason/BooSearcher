# Environment Variables

This document lists the environment variables that are required for different components.

## MongoDB

| Variable Name               | Description |
|-----------------------------|-------------|
| `MONGODB_NAME`              | The name of the MongoDB instance. |
| `NAMESPACE`                 | The namespace where the MongoDB instance will be deployed. |
| `MONGO_INITDB_ROOT_USERNAME`| The username for the MongoDB root user. |
| `MONGO_INITDB_ROOT_PASSWORD`| The password for the MongoDB root user. |
| `MONGO_REPLICA_SET_KEY`| Special replica set key. |

## Web Application

| Variable Name               | Description |
|-----------------------------|-------------|
| `WEB_NAME`               | The name of the web application. |
| `NAMESPACE`                 | The namespace where the web application will be deployed. |
| `REGISTRY_SECRET_NAME`      | The name of the Docker registry secret. |
| `WEB_IMAGE_REPO`         | The Docker repository where the web application image is stored. |
| `WEB_DOCKERTAG`          | The tag of the Docker image to use for the web application. |
| `WEB_SHORT_URL`     | The short URL for the web application in production. This is used for both the ingress host and the ingress secret name. |

## Next.js

| Variable Name         | Description |
|-----------------------|-------------|
| `HOSTNAME`            | The hostname for the Next.js application. Typically set to `0.0.0.0` to allow connections from any IP address. |
| `PORT`                | The port on which the Next.js application will run. |
| `NEXT_PUBLIC_API_URL` | The URL of the API that the Next.js application will connect to. |

Please ensure that these environment variables are set before deploying the Helmfile.
