# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files
COPY --from=build /app/dist/cooperaition-frontend/browser/ /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80