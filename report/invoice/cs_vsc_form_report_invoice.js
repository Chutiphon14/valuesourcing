/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([
  "N/url",
  "N/record",
  "N/currentRecord",
  "N/search",
  "N/query",
  "N/runtime",
  "N/https",
  "N/ui/message",
], function (
  url,
  record,
  currentRecord,
  search,
  query,
  runtime,
  https,
  message
) {
  function pageInit(context) {
    try {
      const rec = context.currentRecord;
      //
      if (!rec.getValue("date_from_field")) {
        rec.setValue("date_from_field", new Date());
      }
      //
      if (!rec.getValue("date_to_field")) {
        rec.setValue("date_to_field", new Date());
      }
      //

      //
    } catch (error) {
      console.log("🚀 ~ pageInit ~ error:", error);
    }
  }

  function saveRecord(context) {}

  function validateField(context) {}

  function fieldChanged(context) {
    try {
      const rec = context.currentRecord;

      if (
        context.fieldId == "subsidiary_field" ||
        context.fieldId == "customer_field" ||
        context.fieldId == "date_to_field" ||
        context.fieldId == "date_from_field"
      ) {
        let subsidiary = rec.getValue("subsidiary_field");
        let customer = rec.getValue("customer_field");
        let dateto = rec.getValue("date_to_field");
        var datetoNew = new Date(dateto);
        var timestamp_dateto = datetoNew.getTime();
        let datefrom = rec.getValue("date_from_field");
        var datefromNew = new Date(datefrom);
        var timestamp_datefrom = datefromNew.getTime();

        let params = {
          subsidiary: subsidiary ? subsidiary : "",
          customer: customer ? customer : "",
          dateto: timestamp_dateto ? timestamp_dateto : "",
          datefrom: timestamp_datefrom ? timestamp_datefrom : "",
        };
        let scriptId = {
          scriptId: "customscript_sl_vsc_report_invoice_sw",
          deploymentId: "customdeploy_sl_vsc_report_invoice_sw",
        };

        let url = getSuiteletUrl(scriptId, params);

        window.onbeforeunload = false;
        window.open(url, "_self");
      }
    } catch (error) {
      console.log("🚀 ~ fieldChanged ~ error:", error);
    }
  }

  function postSourcing(context) {}

  function lineInit(context) {}

  function validateDelete(context) {}

  function validateInsert(context) {}

  function validateLine(context) {}

  function sublistChanged(context) {}

  function getSuiteletUrl(suitelet, params) {
    let output = url.resolveScript({
      scriptId: suitelet.scriptId,
      deploymentId: suitelet.deploymentId,
      // returnExternalUrl: true,
      params: params,
    });
    return output;
  }

  function printReport(item) {
    try {
      const rec = currentRecord.get();
      console.log("🚀 ~ printReport ~ rec:", rec.getValue("invoice_field"));

      var myString = rec.getValue("invoice_field").toString();

      var encodedString = encodeURIComponent(myString || myItems).replace(
        /%([0-9A-F]{2})/g,
        function (match, p1) {
          return String.fromCharCode(parseInt(p1, 16));
        }
      );

      // Convert the string to Base64
      var base64String = base64Encode(encodedString);

      let params = {};
      let scriptId = {
        scriptId: "customscript_sl_vsc_webpage_report_inv",
        deploymentId: "customdeploy_sl_vsc_webpage_report_inv",
      };
      let url = getSuiteletUrl(scriptId, params);

      window.open(url + `list_inv=${base64String}&`, "_blank");
    } catch (error) {
      console.log("🚀 ~ printReport ~ error:", error);
    }
  }

  function printReportInvoice(item) {
    try {
      let params = {};
      let scriptId = {
        scriptId: "customscript_sl_vsc_webpage_report_inv",
        deploymentId: "customdeploy_sl_vsc_webpage_report_inv",
      };
      let url = getSuiteletUrl(scriptId, params);

      window.open(url + `is_inv=${item}&`, "_blank");
    } catch (error) {
      console.log("🚀 ~ printReportInvoice ~ error:", error);
    }
  }

  function base64Encode(string) {
    var encodedString = btoa(string);
    return encodedString;
  }

  return {
    pageInit: pageInit,
    // saveRecord: saveRecord,
    // validateField: validateField,
    fieldChanged: fieldChanged,
    // postSourcing: postSourcing,
    // lineInit: lineInit,
    // validateDelete: validateDelete,
    // validateInsert: validateInsert,
    // validateLine: validateLine,
    // sublistChanged: sublistChanged,
    printReport,
    printReportInvoice,
  };
});
