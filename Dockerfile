# iHealthOne OS 演示网关镜像（仅用于本地演示）
FROM node:20-alpine

LABEL org.opencontainers.image.title="iHealthOne OS Mock Gateway" \
      org.opencontainers.image.vendor="Shenzhen Coordinate Software Group" \
      org.opencontainers.image.url="https://www.cnhis.com" \
      org.opencontainers.image.description="Demo gateway for iHealthOne OS open API. Not for production use."

WORKDIR /app

COPY mock-server ./mock-server
COPY examples/patient-360 ./examples/patient-360

ENV PORT=8787
EXPOSE 8787

RUN addgroup -S ih1 && adduser -S ih1 -G ih1 && chown -R ih1:ih1 /app
USER ih1

CMD ["node", "mock-server/index.js"]
