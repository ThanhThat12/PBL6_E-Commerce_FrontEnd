FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

# 🌟 (1) ĐÃ THÊM: Copy file cấu hình Nginx tùy chỉnh (nginx.conf) 
# để xử lý SPA routing (try_files $uri $uri/ /index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
# 🌟 (2) ĐÃ SỬA: Cú pháp CMD đúng (khắc phục lỗi "[nginx,: not found")
CMD ["nginx", "-g", "daemon off;"]