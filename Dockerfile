ARG OPENAI_API_KEY

FROM oven/bun:1.0-alpine as BASE
LABEL stage "dev"

WORKDIR /usr/src/diagram-viewer

COPY . .

# Build UI tool
WORKDIR /usr/src/diagram-viewer/www
RUN ["bun", "install"]
RUN ["bun", "run", "build"]

EXPOSE 5000

# Start web server
WORKDIR /usr/src/diagram-viewer
RUN ["bun", "install"]

ENTRYPOINT [ "bun", "run", "start" ]