# HIS-yiyuan-hospital 演示网关镜像（仅用于本地演示）
FROM node:20-alpine

LABEL org.opencontainers.image.title="HIS-yiyuan-hospital Mock Gateway" \
      org.opencontainers.image.vendor="Shenzhen Coordinate Software Group" \
      org.opencontainers.image.url="https://www.cnhis.com" \
      org.opencontainers.image.description="Demo gateway for HIS-yiyuan-hospital open API. Not for production use."

WORKDIR /app

COPY mock-server ./mock-server
COPY examples/patient-360 ./examples/patient-360

ENV PORT=8787
EXPOSE 8787

RUN addgroup -S his && adduser -S his -G his && chown -R his:his /app
USER his

CMD ["node", "mock-server/index.js"]
