# Shorten Link frontend project
## Cách triển khai chạy test ở máy Local.
1. Deploy backend stack  
Backend stack có tại repository: `https://github.com/hoanglinhdigital/shorten-link-backend`
2. Copy toàn bộ nội dung trong `vite.config-local.js` ghi đè sang `vite.config.js`  
*Mục đích để tạo proxy từ local lên API Gateway tránh lỗi CORS error.

3. Trong file `.env` Thay thế `VITE_BASE_URL` thành URL của API Gateway Stage (bao gồm cả stage name vd `dev`)
* vd: `https://y7acktc4xh.execute-api.ap-southeast-1.amazonaws.com/dev`
3. Start server local:
* `npm run dev`
* Truy cập thông qua `localhost:<port>`
4. Test thử với một URL bất kỳ (vd trang tin tức có url dài). Kết quả trả về link rút gọn, nhấn nút copy to clipboard.
5. Truy cập thông qua link rút gọn.

## Cách triển khai lên S3 + CloudFront
1. Deploy backend stack  
* Backend stack có tại repository: `https://github.com/hoanglinhdigital/shorten-link-backend`
* Test thử việc truy cập tạo shorten link & link sau khi tạo ra (sử dụng Postman)

2. Tạo CloudFront distribution  
 Add origin API Gateway theo cấu trúc sau:
    - origin domain: url trỏ tới API Gateway stage (không có tên stage)  
    vd: `y7acktc4xh.execute-api.ap-southeast-1.amazonaws.com`
    - Protocol: https only
    - TLS version: TLSv1.2
    - Origin path: tên của stage trên APIGW vd: `/dev`
    - Enable Origin Shield: No
3. Build Frontend project tạo ra static file  
* Copy toàn bộ nội dung trong `vite.config-aws.js` ghi đè sang `vite.config.js`
* Trong file `.env` Thay thế `VITE_BASE_URL` thành domain đang trỏ vào CloudFront
* vd: `https://shortenlink.hoanglinhdigital.com`
* Chạy lệnh `npm run build`, kiểm tra thư mục dist được tạo ra.

4. Tạo một S3 bucket, Enable Static website hosting.
- Copy toàn bộ nội dung trong thư mục `dist` của project, upload lên S3.
- `cd dist`
- `aws s3 cp . s3://<your-bucket-name>/ --recursive`
- Kiểm tra các files được upload lên S3 thành công.
- Truy cập thử thông qua static url của S3, nếu hiển thị được website là OK.

7. Add origin cho S3
- Origin domain: chọn S3 bucket ở bước trên vd: `shorten-link-demo-linh.s3.ap-southeast-1.amazonaws.com`
- Origin path: để trống.
- Origin access chọn: `Origin access control settings (recommended)`
- Origin access control nhấn nút `Create new OAC`
- Nhấn nút Copy policy, truy cập vào s3 bucket trước đó, modify bucket policy, dán vào, save.
- Enable Origin Shield: No


8. Chỉnh sửa Behavior của CloudFront (thứ tự như bên dưới)
* Thêm Origin Behavior path `/api/*` trỏ vào API Gateway.
    - Path pattern: `/api/*`
    - Origin and origin groups: Chọn origin tương ứng với API Gateway.
    - Compress objects automatically: No
    - Viewer protocol policy: `Redirect HTTP to HTTPS`
    - Allowed HTTP methods: `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`
    - Restrict viewer access: No
    - Cache key and origin requests: chọn `Legacy cache settings` sau đó chọn Headers: None, Query strings: None, Cookies None.
    - Response headers policy - optional: Simple CORS
    - Nhấn Save Change.

* Thêm Origin Behavior path `/link/*` trỏ vào API Gateway.
    - Path pattern: `/link/*`
    - Origin and origin groups: Chọn origin tương ứng với API Gateway.
    - Compress objects automatically: No
    - Viewer protocol policy: `Redirect HTTP to HTTPS`
    - Allowed HTTP methods: `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`
    - Restrict viewer access: No
    - Cache key and origin requests: chọn `Legacy cache settings` sau đó chọn Headers: None, Query strings: None, Cookies None.
    - Response headers policy - optional: Simple CORS
    - Nhấn Save Change.
* Chỉnh sửa *(default)  trỏ vào S3.
    - Path pattern: `Default (*)`
    - Origin and origin groups: Chọn origin tương ứng với S3.
    - Compress objects automatically: Yes
    - Viewer protocol policy: `Redirect HTTP to HTTPS`
    - Allowed HTTP methods: `GET, HEAD`
    - Restrict viewer access: No
    - Cache key and origin requests: chọn `Cache policy and origin request policy (recommended)` sau đó chọn Cache policy: CachingOptimized  Recommended for S3.
    - Các setting khác để mặc định sau đó nhấn Save change.

9. Tạo một CNAME record trên Route53 trỏ vào CloudFront vd `shortenlink.hoanglinhdigital.com`
* Các bạn có thể sử dụng Route53 hoặc bất kỳ nhà cung cấp nào khác.
* Modify CloudFront, chỗ Setting nhấn nút `Edit`
* Alternate domain name (CNAME): điền url của CNAME ở bước trên vd: `shortenlink.hoanglinhdigital.com`
* Custom SSL certificate: Chọn SSL Certificate tương ứng (*Yêu cầu đã tạo SSL trước đó sử dụng dịch vụ AWS Certificate Manager - ACM)
* Security policy: chọn `TLSv1.2_2021 (recommended)`
* Các setting khác để mặc định.
10. Test việc truy cập.
* Truy cập domain đã setting vd: `https://shortenlink.hoanglinhdigital.com/index.html` *Lưu ý phải có `/index.html` ở cuối.
* Sử dụng một URL dài (vd trang tin tức), thử tạo link rút gọn.
* Kết quả trả về link rút gọn, nhấn nút Copy sau đó truy cập thử = link rút gọn.


## Chúc các bạn thành công!