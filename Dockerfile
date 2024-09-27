# Step 1: Build the Angular app
FROM node:alpine as build

# Set the working directory
WORKDIR /usr/src/app

# Copy the package.json and install dependencies
COPY package*.json ./
RUN npm install -g @angular/cli && npm install

# Copy the rest of the Angular project files
COPY . .

# Build the Angular app for production
RUN npm run build --prod

# Step 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the custom nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the Angular build output to Nginx's html directory
COPY --from=build /usr/src/app/dist/test-ui/browser/. /usr/share/nginx/html

# Expose port 80 for the Angular app
EXPOSE 80
