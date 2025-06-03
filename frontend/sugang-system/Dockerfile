FROM node:18-alpine AS builder

WORKDIR /app
COPY . .

ENV REACT_APP_API_BASE_URL=http://nacho2407.duckdns.org:8000

RUN npm install
RUN npm run build


FROM node:18-alpine

RUN npm install -g serve

COPY --from=builder /app/build /app

WORKDIR /app
EXPOSE 80

CMD ["serve", "-s", ".", "-l", "80"]
