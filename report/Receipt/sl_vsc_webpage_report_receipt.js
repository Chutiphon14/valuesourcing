/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define([
  "N/render",
  "N/file",
  "N/search",
  "N/record",
  "N/ui/serverWidget",
  "N/format",
  "N/url",
  "N/encode",
  "N/runtime",
], function (
  render,
  file,
  search,
  record,
  serverWidget,
  format,
  url,
  encode,
  runtime
) {
  function onRequest(context) {
    // try {
    let request = context.request;
    let response = context.response;
    let params = request.parameters;
    let bodys = request.body;

    let list_copy = [
      {
        text: "บิลเงินสด/ใบกำกับภาษี",
        class: "box1",
        form: "ต้นฉบับ (สำหรับลูกค้า)",
      },
      {
        text: "บิลเงินสด/ใบกำกับภาษี",
        class: "boxs",
        form: "สำเนา (สำหรับลูกค้า)",
      },
    ];
    let list_jsonXML = [];
    // F1EF99
    // E8EFCF
    var instanceId = runtime.accountId;
    const instance_url = instanceId.toLowerCase().replace("_", "-");

    let scheme = "https://";
    let host = url.resolveDomain({
      hostType: url.HostType.APPLICATION,
    });
    let myBaseURL = scheme + host;

    let angsananew = file.load({
      id: "../../fonts/Angsana New V1 V2.ttf",
    });
    // log.debug('tahomafont', tahomafont);
    let angsananewbold = file.load({
      id: "../../fonts/angsab.ttf",
    });

    let angsananewita = file.load({
      id: "../../fonts/ANGSAI.ttf",
    });
    // log.debug('tahomafont', tahomafont);
    let angsananewitabold = file.load({
      id: "../../fonts/AngsanaNewBoldItalic.ttf",
    });

    let normal = myBaseURL + angsananew.url;
    let bold = myBaseURL + angsananewbold.url;
    let ita = myBaseURL + angsananewita.url;
    let itabold = myBaseURL + angsananewitabold.url;

    const { lang = "th", list_inv = "", is_inv = "" } = params;

    log.debug("bodys", list_inv);
    var decodedString = "";
    var split_list_inv = [];
    if (list_inv != "") {
      decodedString = encode.convert({
        string: list_inv,
        inputEncoding: encode.Encoding.BASE_64,
        outputEncoding: encode.Encoding.UTF_8,
      });

      split_list_inv = decodedString.split(",");
    } else {
      log.debug("[is_inv]", [is_inv]);
      split_list_inv = [is_inv];
    }

    if (split_list_inv.length > 0) {
      split_list_inv.forEach((inv) => {
        log.debug("inv", inv);

        let jsonXML = {
          item: [],
          gross_amount: 0,
          less_discount: 0,
          after_discount: 0,
          vat: 0,
          total: 0,
        };

        const invoiceRecord = record.load({
          type: "invoice",
          id: inv,
          isDynamic: true,
        });

        const resultInvoiceBillAddress = searchInvoiceBillAddress({
          id: inv,
        });

        const subsidiaryRecord = record.load({
          type: "subsidiary",
          id: invoiceRecord.getValue("subsidiary"),
          isDynamic: true,
        });

        const termRecord = record.load({
          type: "term",
          id: invoiceRecord.getValue("terms"),
          isDynamic: true,
        });

        let taxbranchId = "404";

        if (runtime.accountId.toLowerCase().replace("_", "-") != "2795756") {
          folderId = "1";
        }

        const taxBranchNumberRecord = record.load({
          type: "customrecord_csegtaxbranch",
          id: invoiceRecord.getValue("csegtaxbranch") || taxbranchId,
          isDynamic: true,
        });

        const customerRecord = record.load({
          type: "customer",
          id: invoiceRecord.getValue("entity"),
          isDynamic: true,
        });

        const resultCustomerAddress = searchCustomerAddress({
          id: invoiceRecord.getValue("entity"),
        });

        const imageId = subsidiaryRecord.getValue("logo");

        if (imageId.length > 0) {
          var fileObj = file.load({
            id: imageId,
          });

          jsonXML.logo =
            `https://${instance_url}.app.netsuite.com` + fileObj.url;
        } else {
          jsonXML.logo = "";
        }

        const signimageId = taxBranchNumberRecord.getValue(
          "custrecord_inpth_signature"
        );

        if (signimageId.length > 0) {
          var fileObj = file.load({
            id: signimageId,
          });

          jsonXML.signature =
            `https://${instance_url}.app.netsuite.com` + fileObj.url;
        } else {
          jsonXML.signature = "";
        }

        jsonXML.legalname = taxBranchNumberRecord.getValue(
          "custrecord_inpth_taxlegalname"
        );

        jsonXML.address_tax = `${taxBranchNumberRecord.getValue(
          "custrecord_inpth_address1"
        )} แขวง${taxBranchNumberRecord.getValue(
          "custrecord_inpth_address2"
        )} อำเภอ${taxBranchNumberRecord.getValue(
          "custrecord_inpth_city"
        )} จังหวัด${taxBranchNumberRecord.getValue(
          "custrecord_inpth_state"
        )} ${taxBranchNumberRecord.getValue("custrecord_inpth_zip")}`;
        jsonXML.phone = taxBranchNumberRecord.getValue("custrecord_inpth_tel");
        jsonXML.email = taxBranchNumberRecord.getValue(
          "custrecordcustrecord_inpth_email"
        );
        jsonXML.taxid = taxBranchNumberRecord.getValue(
          "custrecord_inpth_taxid"
        );
        jsonXML.branchcode = taxBranchNumberRecord.getValue(
          "custrecord_inpth_branchcode"
        );

        if (invoiceRecord.getValue("custbody_inpth_actual_customer_name")) {
          jsonXML.customernumber = invoiceRecord.getValue(
            "custbody_inpth_actual_customer_name"
          );
        } else {
          jsonXML.customernumber = customerRecord.getValue("altname");
        }

        if (invoiceRecord.getValue("custbody_inpth_actual_customer_name")) {
          jsonXML.customercompany = invoiceRecord.getValue(
            "custbody_inpth_actual_customer_name"
          );
        } else {
          jsonXML.customercompany = customerRecord.getValue("companyname");
        }

        if (
          invoiceRecord.getValue("custbody_inpth_customer_address1") &&
          invoiceRecord.getValue("custbody_inpth_customer_address2") &&
          invoiceRecord.getValue("custbody_inpth_zip_code")
        ) {
          jsonXML.customer_address = `${invoiceRecord.getValue(
            "custbody_inpth_customer_address1"
          )} ${invoiceRecord.getValue(
            "custbody_inpth_customer_address2"
          )} ${invoiceRecord.getValue("custbody_inpth_zip_code")}`;
        } else {
          jsonXML.customer_address = resultInvoiceBillAddress[0]?.address;
        }

        jsonXML.customer_phone = customerRecord.getValue("phone");
        jsonXML.customer_fax = customerRecord.getValue("fax");

        if (invoiceRecord.getValue("custbody_inpth_acutal_customer_id")) {
          jsonXML.customer_taxid = invoiceRecord.getValue(
            "custbody_inpth_acutal_customer_id"
          );
        } else {
          jsonXML.customer_taxid = invoiceRecord.getValue("vatregnum");
        }

        if (invoiceRecord.getValue("custbody_inpth_tax_branch_hq")) {
          jsonXML.customer_head = true;
          jsonXML.customer_head_name = invoiceRecord.getValue(
            "custbody_inpth_tax_branch_hq"
          );
        } else if (invoiceRecord.getValue("custbody_inpth_tax_branch_number")) {
          jsonXML.customer_head = false;
          jsonXML.customer_head_name = invoiceRecord.getValue(
            "custbody_inpth_tax_branch_number"
          );
        } else {
          jsonXML.customer_head = false;
          // jsonXML.customer_head_name = resultCustomerAddress[0]?.addressee;
          jsonXML.customer_head_name = invoiceRecord.getValue(
            "custbody_rpt_billtoselect"
          );
        }

        jsonXML.customer_po = invoiceRecord.getText("otherrefnum");
        jsonXML.customer_inv = invoiceRecord.getValue("tranid");
        jsonXML.customer_date = invoiceRecord.getText("trandate");
        jsonXML.customer_day_term = termRecord.getValue("daysuntilnetdue");

        var salesOrder = invoiceRecord.getText("createdfrom");
        var parts = salesOrder.split("#");
        if (parts.length > 0) {
          jsonXML.customer_createdfrom = parts[1];
        } else {
          jsonXML.customer_createdfrom = invoiceRecord.getText("createdfrom");
        }

        jsonXML.customer_salesrep = invoiceRecord.getText("salesrep");
        jsonXML.customer_shiptoselect = invoiceRecord.getValue(
          "custbody_rpt_shiptoselect"
        );

        const lineItem = invoiceRecord.getLineCount({ sublistId: "item" });

        for (let index = 0; index < lineItem; index++) {
          log.debug(
            "getLineCount",
            invoiceRecord.getSublistText({
              sublistId: "item",
              fieldId: "item",
              line: index,
            })
          );
          jsonXML.item.push({
            description: invoiceRecord.getSublistText({
              sublistId: "item",
              fieldId: "item",
              line: index,
            }),
            quantity: `${formatNumberWithoutToLocaleString(
              invoiceRecord.getSublistValue({
                sublistId: "item",
                fieldId: "quantity",
                line: index,
              }),
              true
            )} ${invoiceRecord.getSublistText({
              sublistId: "item",
              fieldId: "units",
              line: index,
            })}`,
            rate: invoiceRecord.getSublistText({
              sublistId: "item",
              fieldId: "rate",
              line: index,
            }),
            discount: "",
            amount: invoiceRecord.getSublistText({
              sublistId: "item",
              fieldId: "amount",
              line: index,
            }),
          });

          jsonXML.gross_amount += parseFloat(
            invoiceRecord.getSublistValue({
              sublistId: "item",
              fieldId: "amount",
              line: index,
            })
          );

          jsonXML.vat += parseFloat(
            invoiceRecord.getSublistValue({
              sublistId: "item",
              fieldId: "tax1amt",
              line: index,
            })
          );
        }

        jsonXML.after_discount = jsonXML.gross_amount - jsonXML.less_discount;
        jsonXML.total = jsonXML.after_discount + jsonXML.vat;

        jsonXML.gross_amount = formatNumberWithoutToLocaleString(
          jsonXML.gross_amount
        );
        jsonXML.less_discount = formatNumberWithoutToLocaleString(
          jsonXML.less_discount
        );
        jsonXML.after_discount = formatNumberWithoutToLocaleString(
          jsonXML.after_discount
        );
        jsonXML.vat = formatNumberWithoutToLocaleString(jsonXML.vat);
        jsonXML.total = formatNumberWithoutToLocaleString(jsonXML.total);

        jsonXML.remark = invoiceRecord.getText("custbody_vsc_ar_inv_remark");
        jsonXML.total_text = BAHTTEXT(jsonXML.total);

        list_jsonXML.push(jsonXML);
      });
    }

    // log.debug("jsonXML", jsonXML);

    log.debug("list_jsonXML", list_jsonXML);

    let xmlTemplateFile = "";
    let renderer = render.create();

    if (lang == "th") {
      xmlTemplateFile = file.load("./report_receipt_th.xml");
    } else {
      // xmlTemplateFile = file.load("./report_moveout_eng.xml");
      xmlTemplateFile = file.load("./report_receipt_th.xml");
    }

    renderer.templateContent = xmlTemplateFile.getContents();

    renderer.addCustomDataSource({
      format: render.DataSource.JSON,
      alias: "JSON_STR",
      data: JSON.stringify({
        item: list_jsonXML,
        font_regular: normal,
        font_bold: bold,
        font_ita: ita,
        font_itabold: itabold,
        copy: list_copy,
      }),
    });

    let xmlfile = renderer.renderAsPdf();
    // log.debug("xmlfile", xmlfile);
    response.writeFile(xmlfile, true);
    // } catch (error) {
    //   log.debug("error catch", error);
    // }
  }

  function searchCustomerAddress(obj) {
    try {
      var customrecord_search_obj = search.create({
        type: "customer",
        filters: [
          ["address.isdefaultbilling", "is", "T"],
          "AND",
          ["isshipaddress", "is", "T"],
          "AND",
          ["internalid", "anyof", obj.id],
        ],
        columns: [
          "internalid",
          search.createColumn({ name: "entityid", label: "ID" }),
          search.createColumn({ name: "altname", label: "Name" }),
          search.createColumn({
            name: "address1",
            join: "Address",
            label: "Address 1",
          }),
          search.createColumn({
            name: "address2",
            join: "Address",
            label: "Address 2",
          }),
          search.createColumn({
            name: "custrecord_vsc_addressstate",
            join: "Address",
            label: "State (จังหวัด)",
          }),
          search.createColumn({
            name: "zipcode",
            join: "Address",
            label: "Zip Code",
          }),
          search.createColumn({
            name: "addressee",
            join: "Address",
            label: "Addressee",
          }),
        ],
      });

      var results = [];
      var val = [];
      var i = 0;

      var resultSet = customrecord_search_obj.run();

      do {
        slice = resultSet.getRange({ start: i, end: i + 1000 });
        val = val.concat(slice);
        i += 1000;
      } while (slice.length >= 1000);

      results = val.map((e) => {
        return {
          internalid: e.getValue("internalid"),
          address: `${e.getValue({
            name: "address1",
            join: "Address",
            label: "Address 1",
          })} ${e.getValue({
            name: "address2",
            join: "Address",
            label: "Address 2",
          })} ${e.getValue({
            name: "custrecord_vsc_addressstate",
            join: "Address",
            label: "State (จังหวัด)",
          })} ${e.getValue({
            name: "zipcode",
            join: "Address",
            label: "Zip Code",
          })}`,
          name: e.getValue({ name: "altname", label: "Name" }),
          addressee: e.getValue({
            name: "addressee",
            join: "Address",
            label: "Addressee",
          }),
        };
      });

      return results;
    } catch (error) {
      return [];
    }
  }

  function searchtypeSubsidiaryAddress(obj) {
    try {
      var customrecord_search_obj = search.create({
        type: "subsidiary",
        filters: [["internalid", "anyof", obj.id]],
        columns: [
          "internalid",
          search.createColumn({ name: "name", label: "Name" }),
          search.createColumn({
            name: "address1",
            join: "address",
            label: " Address 1",
          }),
          search.createColumn({
            name: "address2",
            join: "address",
            label: " Address 2",
          }),
          search.createColumn({
            name: "city",
            join: "address",
            label: " City",
          }),
          search.createColumn({
            name: "zip",
            join: "address",
            label: " Zip",
          }),
          search.createColumn({
            name: "custrecord_inpth_iv_re_phone",
            label: "Phone",
          }),
          search.createColumn({ name: "email", label: "Email" }),
          search.createColumn({ name: "taxidnum", label: "Tax ID" }),
        ],
      });

      var results = [];
      var val = [];
      var i = 0;

      var resultSet = customrecord_search_obj.run();

      do {
        slice = resultSet.getRange({ start: i, end: i + 1000 });
        val = val.concat(slice);
        i += 1000;
      } while (slice.length >= 1000);

      results = val.map((e) => {
        return {
          internalid: e.getValue("internalid"),
          address: `${e.getValue({
            name: "address1",
            join: "address",
            label: " Address 1",
          })} ${e.getValue({
            name: "address2",
            join: "address",
            label: " Address 2",
          })} ${e.getValue({
            name: "city",
            join: "address",
            label: " City",
          })} ${e.getValue({
            name: "zip",
            join: "address",
            label: " Zip",
          })}`,
          phone: e.getValue({
            name: "custrecord_inpth_iv_re_phone",
            label: "Phone",
          }),
          email: e.getValue({
            name: "email",
            label: "Email",
          }),
          taxid: e.getValue({
            name: "taxidnum",
            label: "Tax ID",
          }),
        };
      });

      return results;
    } catch (error) {
      return [];
    }
  }

  function searchInvoiceBillAddress(obj) {
    try {
      var customrecord_search_obj = search.create({
        type: "invoice",
        filters: [
          ["internalid", "anyof", obj.id],
          "AND",
          ["mainline", "is", "T"],
          "AND",
          ["type", "anyof", "CustInvc"],
        ],
        // columns: [
        //   "internalid",
        //   ["internalid", "anyof", "12643"],
        //   "AND",
        //   ["mainline", "is", "T"],
        //   "AND",
        //   ["type", "anyof", "CustInvc"],
        // ],
        columns: [
          "internalid",
          search.createColumn({ name: "tranid", label: "Document Number" }),
          search.createColumn({
            name: "billaddress1",
            label: "Billing Address 1",
          }),
          search.createColumn({
            name: "billaddress2",
            label: "Billing Address 2",
          }),
          search.createColumn({ name: "billcity", label: "Billing City" }),
          search.createColumn({ name: "billzip", label: "Billing Zip" }),
        ],
      });

      var results = [];
      var val = [];
      var i = 0;

      var resultSet = customrecord_search_obj.run();

      do {
        slice = resultSet.getRange({ start: i, end: i + 1000 });
        val = val.concat(slice);
        i += 1000;
      } while (slice.length >= 1000);

      results = val.map((e) => {
        return {
          internalid: e.getValue("internalid"),
          address: `${e.getValue({
            name: "billaddress1",
            label: "Billing Address 1",
          })} ${e.getValue({
            name: "billaddress2",
            label: "Billing Address 2",
          })} ${e.getValue({
            name: "billcity",
            label: "Billing City",
          })} ${e.getValue({
            name: "billzip",
            label: "Billing Zip",
          })}`,
        };
      });

      return results;
    } catch (error) {
      return [];
    }
  }

  function BAHTTEXT(num, suffix) {
    "use strict";

    if (typeof suffix === "undefined") {
      suffix = "บาทถ้วน";
    }

    num = num || 0;
    num = num.toString().replace(/[, ]/g, ""); // remove commas, spaces

    if (isNaN(num) || Math.round(parseFloat(num) * 100) / 100 === 0) {
      return "ศูนย์บาทถ้วน";
    } else {
      var t = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"],
        n = [
          "",
          "หนึ่ง",
          "สอง",
          "สาม",
          "สี่",
          "ห้า",
          "หก",
          "เจ็ด",
          "แปด",
          "เก้า",
        ],
        len,
        digit,
        text = "",
        parts,
        i;

      if (num.indexOf(".") > -1) {
        // have decimal

        /*
         * precision-hack
         * more accurate than parseFloat the whole number
         */

        parts = num.toString().split(".");

        num = parts[0];
        parts[1] = parseFloat("0." + parts[1]);
        parts[1] = (Math.round(parts[1] * 100) / 100).toString(); // more accurate than toFixed(2)
        parts = parts[1].split(".");

        if (parts.length > 1 && parts[1].length === 1) {
          parts[1] = parts[1].toString() + "0";
        }

        num = parseInt(num, 10) + parseInt(parts[0], 10);

        /*
         * end - precision-hack
         */
        text = num ? BAHTTEXT(num) : "";

        if (parseInt(parts[1], 10) > 0) {
          text = text.replace("ถ้วน", "") + BAHTTEXT(parts[1], "สตางค์");
        }

        return text;
      } else {
        if (num.length > 7) {
          // more than (or equal to) 10 millions

          var overflow = num.substring(0, num.length - 6);
          var remains = num.slice(-6);
          return (
            BAHTTEXT(overflow).replace("บาทถ้วน", "ล้าน") +
            BAHTTEXT(remains).replace("ศูนย์", "")
          );
        } else {
          len = num.length;
          for (i = 0; i < len; i = i + 1) {
            digit = parseInt(num.charAt(i), 10);
            if (digit > 0) {
              if (
                len > 2 &&
                i === len - 1 &&
                digit === 1 &&
                suffix !== "สตางค์"
              ) {
                text += "เอ็ด" + t[len - 1 - i];
              } else {
                text += n[digit] + t[len - 1 - i];
              }
            }
          }

          // grammar correction
          text = text.replace("หนึ่งสิบ", "สิบ");
          text = text.replace("สองสิบ", "ยี่สิบ");
          text = text.replace("สิบหนึ่ง", "สิบเอ็ด");

          return text + suffix;
        }
      }
    }
  }

  function formatNumberWithoutToLocaleString(number, isInt = false) {
    // แยกเลขจำนวนด้วย comma
    let numberReturn = 0;
    log.debug("number", number);

    var parts = number.toString().split(".");
    log.debug("parts", parts);
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // // เพิ่มจุดทศนิยมถ้ามี
    // if (parts.length === 1) {
    //   parts.push("00"); // ถ้าไม่มีจุดทศนิยมให้เพิ่ม .00
    // } else if (parts[1].length === 1) {
    //   parts[1] += "0"; // ถ้ามีจุดทศนิยมแค่หลักเดียวให้เพิ่ม 0 ที่หลักทศนิยมสอง
    // }

    // สร้างทศนิยมเพียง 2 ตำแหน่ง
    if (isInt) {
      return parts[0];
    } else {
      if (parts.length === 1) {
        parts.push("00"); // ถ้าไม่มีจุดทศนิยมให้เพิ่ม .00
      } else {
        parts[1] =
          parts[1].length > 1 ? parts[1].substring(0, 2) : parts[1] + "0"; // ถ้ามีทศนิยมแค่หลักเดียวให้เพิ่ม 0 ที่หลักทศนิยมสอง
      }

      numberReturn = parts.join(".");

      return numberReturn;
    }
  }

  return {
    onRequest: onRequest,
  };
});
