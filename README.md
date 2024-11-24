# Shorten Link frontend project
## Cách triển khai chạy test ở máy Local.
1. Deploy backend stack  
Backend stack có tại repository: `https://github.com/hoanglinhdigital/shorten-link-backend`
2. Copy toàn bộ nội dung trong `vite.config-local.js` ghi đè sang `vite.config.js`  
*Mục đích để tạo proxy từ local lên API Gateway tránh lỗi CORS error.

3. Trong file `.env` Thay thế `VITE_BASE_URL` thành URL của API Gateway Stage (bao gồm cả stage name vd `dev`)
* vd: `https://y7acktc4xh.execute-api.ap-southeast-1.amazonaws.com/dev`
3. Start server local:
* `npm install`
* `npm run dev`
* Truy cập thông qua `localhost:<port>`
4. Test thử với một URL bất kỳ (vd trang tin tức có url dài). Kết quả trả về link rút gọn, nhấn nút copy to clipboard.
5. Truy cập thông qua link rút gọn.

## Cách triển khai lên S3 + CloudFront
1. Deploy backend stack  
* Backend stack có tại repository: `https://github.com/hoanglinhdigital/shorten-link-backend`
* Test thử việc truy cập tạo shorten link & link sau khi tạo ra (sử dụng Postman)

2. Build Frontend project tạo ra static file  
* Copy toàn bộ nội dung trong `vite.config-aws.js` ghi đè sang `vite.config.js`
* Trong file `.env` Thay thế `VITE_BASE_URL` thành domain dự tính trỏ vào CloudFront
* vd: `https://short.hoanglinhdigital.com`
* Chạy lệnh `npm run build`, kiểm tra thư mục dist được tạo ra.

3. Tạo một S3 bucket, Enable Static website hosting.
- bucket name vd: `final-assignment-2-web-bucket`
- Copy toàn bộ nội dung trong thư mục `dist` của project, upload lên S3.
- `cd dist`
- `aws s3 cp . s3://<your-bucket-name>/ --recursive`
- Kiểm tra các files được upload lên S3 thành công.
- Add policy sau vào s3 bucket policy:(Policy tham khảo cho S3 bucket)  
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Statement1",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::<your-bucket-name>/*"
        }
    ]
}
```
- Truy cập thử thông qua static url của S3, nếu hiển thị được website là OK.

4. Tạo CloudFront distribution & add S3 bucket làm origin.
* Origin domain: chọn S3 bucket ở bước trên vd: `shorten-link-demo-linh.s3.ap-southeast-1.amazonaws.com`
* Origin path: để trống.
* Name: đặt một tên bất kỳ vd: `frontend-website`
* Origin access chọn: `Origin access control settings (recommended)` sau đó nhấn nút `Create new OAC`
* Enable Origin Shield chọn `No`
* Default cache behavior: 
    - Compress objects automatically chọn `No`
    - Viewer protocol policy chọn `Redirect HTTP to HTTPS`-
    - Allowed HTTP methods chọn `GET, HEAD`, Restrict viewer access chọn `No`  
    - Cache key and origin requests: Cache policy and origin request policy (recommended), Cache policy chọn `Caching Optimized`, Origin request policy không chọn, Response headers policy - optional chọn `Simple CORS`
* Web Application Firewall (WAF)  chọn không sử dụng WAF.
* Settings:
    - Price class để mặc định.
    - Alternate domain name (CNAME) - optional add một tên miền bạn dự định trỏ vào CloudFront vd: `short.hoanglinhdigital.com`
    - SSL Certificate: Chọn SSL ceritificat tương ứng (tạo sử dụng dịch vụ Certificate Manager)
    - Chọn `TLSv1.2_2021`
    - Supported HTTP versions: chọn `HTTP/2`
* Nhấn nút Create `Distribution`
* Sau khi CloudFront được tạo xong sẽ có một popup warning với nội dung: `The S3 bucket policy needs to be updated`, Click Copy policy sau đó dán vào Bucket Policy của S3.

* Chờ đợi CloudFront deploy xong sau đó truy cập thử CloudFront thông qua link vd: `https://clondfrontxxx.net/index.html` *Lưu ý phải có `index.html`

5. Thêm Origin cho API Gateway.
* Truy cập vào CloudFront vừa tạo ra ở bước trên, tab `Origin`, nhấn `Create Origin`
* Origin domain: chọn API Gateway đã tạo ra ở bước trên.
* Protocol: `HTTPS only`, Minimum Origin SSL protocol chọn `TLS 1.2`
* Origin path: `/dev`
* Name đặt tên vd: `api-backend`
* Enable Origin Shield: `No`


6. Chỉnh sửa Behavior của CloudFront (thứ tự như bên dưới)  
* Truy cập vào CloudFront vừa tạo ra ở bước trên, tab `Behaviors`, nhấn `Create Behavior`
* Thêm Origin Behavior path `/api/*` trỏ vào API Gateway.
    - Path pattern: `/api/*`
    - Origin and origin groups: Chọn origin tương ứng với API Gateway.
    - Compress objects automatically: No
    - Viewer protocol policy: `Redirect HTTP to HTTPS`
    - Allowed HTTP methods: `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`
    - Restrict viewer access: No
    - Cache key and origin requests: chọn `Cache policy and origin request policy (recommended)` sau đó chọn Cache Policy: `CachingDisabled`, Origin request policy - optional chọn `AllViewerExceptHostHeader` 
    - Response headers policy - optional chọn `Simple CORS`
    - Nhấn `Create Behavior`
    - Sử dụng postman call đến API: `https://cloudfrontxxx.net/api/generate-short-url` xem có tạo được link rút gọn không?

* Thêm Origin Behavior path `/link/*` trỏ vào API Gateway.
    - Path pattern: `/link/*`
    - Origin and origin groups: Chọn origin tương ứng với API Gateway.
    - Compress objects automatically: No
    - Viewer protocol policy: `Redirect HTTP to HTTPS`
    - Allowed HTTP methods: `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`
    - Restrict viewer access: No
    - Cache key and origin requests: chọn `Cache policy and origin request policy (recommended)` sau đó chọn Cache Policy: `CachingDisabled`, Origin request policy - optional chọn `AllViewerExceptHostHeader` 
    - Response headers policy - optional chọn `Simple CORS`
    - Nhấn `Create Behavior`
    - Tạo một link rút gọn sử dụng link `https://cloudfrontxxx.net/api/generate-short-url`
    - Truy cập thử CloudFront thông qua link vd: `https://cloudfrontxxx.net/link/<link-id>` xem có redirect sang trang web gốc không.

7. Tạo một CNAME record trên Route53 trỏ vào CloudFront vd `short.hoanglinhdigital.com`
* Các bạn có thể sử dụng Route53 hoặc bất kỳ nhà cung cấp nào khác.

8. Test việc truy cập.
* Truy cập domain đã setting vd: `https://short.hoanglinhdigital.com/index.html` *Lưu ý phải có `/index.html` ở cuối.
* Sử dụng một URL dài (vd trang tin tức), thử tạo link rút gọn.
* Kết quả trả về link rút gọn, nhấn nút Copy sau đó truy cập thử = link rút gọn.


## Chúc các bạn thành công!