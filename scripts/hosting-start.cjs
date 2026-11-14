// File khởi động app trên hosting iNET (LiteSpeed + CloudLinux Node.js Selector), dùng làm "startup file"
// thay cho server.js. pack-deploy.mjs chép file này vào thư mục app thành start.js.
//
// Vấn đề: LiteSpeed mở thêm tiến trình lsnode mỗi khi có nhiều request cùng lúc nhưng không tự đóng các
// tiến trình rảnh. Chúng tích dần tới hạn mức 150 process của gói hosting và làm web treo. Tài khoản
// hosting lại không nhìn thấy / không kill được các tiến trình này (CageFS).
// Cách xử lý: mỗi tiến trình tự thoát khi không có request nào đang chạy và đã rảnh quá APP_IDLE_EXIT_MS
// (mặc định 5 phút). Request sau đó LiteSpeed tự mở tiến trình mới (~2 giây).
"use strict";

const http = require("node:http");

const IDLE_MS = Number(process.env.APP_IDLE_EXIT_MS) || 5 * 60 * 1000;
let active = 0;
let lastActivity = Date.now();

const emit = http.Server.prototype.emit;
http.Server.prototype.emit = function (event, req, res) {
  if (event === "request" && res) {
    active++;
    lastActivity = Date.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      active--;
      lastActivity = Date.now();
    };
    res.once("finish", finish);
    res.once("close", finish);
  }
  return emit.apply(this, arguments);
};

setInterval(() => {
  if (active === 0 && Date.now() - lastActivity > IDLE_MS) process.exit(0);
}, 30 * 1000).unref();

require("./server.js");
