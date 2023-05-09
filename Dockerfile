FROM node:18-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn

RUN mkdir -p /app/public/uploads && \
    chown -R appuser:appgroup /app/public/uploads && \
    chmod -R 777 /app/public/uploads

COPY . .
 
RUN npx tsc

RUN apk add --no-cache mongodb-tools

ENV MONGODB_URL=${MONGODB_URL}

ENV JWT_SECRET=${JWT_SECRET}

USER appuser

CMD ["node", "bin/www"]

EXPOSE 3000
