# Use the official Node.js image with Alpine Linux
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Set the command to run your app
CMD ["node", "index.js"]