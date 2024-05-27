1 >> vscodeExtensionRestlet.js อัพ script และ deploy

(จะได้รับ EXTERNAL URL ไปใส่ที่ netSuiteUpload.restlet)

2 >> setup > integrantion > manageintergantion >
2.1 >> ใส่ชื่อ application
2.2 >> subtab > Authentication > token-base authen > ติ๊ก token-based authentication อันเดียว
2.3 >> oAuth 2.0 > ไม่ติ๊ก > save

(จะได้รับ consumer key/ client id ไปใส่ที่ netSuiteUpload.consumerToken และ consumer secret / client secret ไปใส่ที่ netSuiteUpload.consumerSecret)

3 >> setup > users/roles > access token > new
3.1 >> access token > เลือกชื่อ application
3.2 >> เลือก user ตัวเอง
3.3 >> role Custom Developer > save

(จะได้รับ TOKEN ID ไปใส่ที่ netSuiteUpload.netSuiteKey และ TOKEN SECRET ไปใส่ที่ netSuiteUpload.netSuiteSecret)

https://vscode.dev/profile/github/ef9050947bf601839e6ad31c9d8f4339
