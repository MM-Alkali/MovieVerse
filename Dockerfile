FROM node:18-alpine

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn

COPY /public/uploads /app/

COPY . .
 
RUN npx tsc

RUN apk add --no-cache mongodb-tools

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV MONGODB_URI=${MONGODB_URI}

ENV JWT_SECRET=${JWT_SECRET}

USER appuser

CMD ["node", "bin/www"]

EXPOSE 3000