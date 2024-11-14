# Shorten Link frontend project

1. Deploy backend stack  
Backend stack có tại repository: `https://github.com/hoanglinhdigital/devops-for-beginner` folder: `serverless-application-model`
2. Thay thế url trong file: `vite.config.js`  
- Line 8: tên của stage trên API Gateway vd `dev`
- Line 9: URL của API Gateway vd: `https://kex77sejd3.execute-api.ap-southeast-1.amazonaws.com`
3. Start server local:
- `npm run dev`
4. Test thử với một URL bất kỳ.
5. Truy cập thông qua link rút gọn.