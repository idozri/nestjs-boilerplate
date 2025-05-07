# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Build the project
RUN npm run build

# Expose the NestJS app port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]