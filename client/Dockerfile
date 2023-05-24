# Use the official Node.js image as the base image
FROM node:alpine as builder1

# Set the working directory
WORKDIR /app1

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the app source code
COPY . .

# Build the React app
RUN npm run build

# Serve the static files using Nginx
FROM nginx:alpine as app1

COPY --from=builder1 /app1/build /usr/share/nginx/html/app1
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY certs/cert1.pem /etc/ssl/certs/
COPY certs/key1.pem /etc/ssl/private/
