# job-platform/frontend/Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json .
RUN npm install
RUN npm install -D tailwindcss postcss autoprefixer
RUN npm install @mui/material @emotion/react @emotion/styled @monaco-editor/react react-feather react-hot-toast  
COPY . .
CMD ["npm", "start"]