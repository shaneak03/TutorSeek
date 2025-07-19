FROM node:alpine

ENV NODE_ENV=development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
RUN npx expo install typescript

COPY . .

# Expose Metro (8081), Expo Go (19000), and web (19006) ports
EXPOSE 8081 19000 19001 19002 19006

# Run the application.
CMD ["npx", "expo", "start", "--tunnel"]