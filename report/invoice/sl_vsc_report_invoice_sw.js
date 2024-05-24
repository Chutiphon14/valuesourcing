/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define([
  "N/search",
  "N/ui/serverWidget",
  "N/https",
  "N/file",
  "N/runtime",
  "N/query",
], function (search, serverWidget, https, file, runtime, query) {
  function onRequest(context) {
    if (context.request.method === "GET") {
      var form = serverWidget.createForm({
        title: "เอกสารใบแจ้งหนี้",
      });

      var dateFromString = "";
      var dateToString = "";

      form.clientScriptModulePath = "./cs_vsc_form_report_invoice.js";

      var request = context.request;
      const {
        parameters: {
          subsidiary: subsidiaryId,
          customer: customerId,
          datefrom,
          dateto,
        } = {},
      } = request;

      let paramGroup = form.addFieldGroup({
        id: "parameters_group",
        label: "Parameters",
      });

      var subsidiary = form.addField({
        id: "subsidiary_field",
        type: serverWidget.FieldType.SELECT,
        source: "subsidiary",
        label: "Subsidiary",
        container: "parameters_group",
      });

      if (subsidiaryId) {
        subsidiary.defaultValue = subsidiaryId;
      }

      var customer = form.addField({
        id: "customer_field",
        type: serverWidget.FieldType.SELECT,
        // source: "customer",
        label: "customer",
        container: "parameters_group",
      });

      if (subsidiaryId) {
        customer.addSelectOption({
          value: "",
          text: "All Customer",
        });
        const resultCustomer = searchCustomerBySubsidiry({ id: subsidiaryId });
        resultCustomer.forEach((element) => {
          customer.addSelectOption({
            value: element.internalid,
            text: element.name,
          });
        });
      }

      if (customerId) {
        customer.defaultValue = customerId;
      }

      var invoice = form.addField({
        id: "invoice_field",
        type: serverWidget.FieldType.MULTISELECT,
        // source: "invoice",
        label: "invoice",
        container: "parameters_group",
      });

      let dateFromfield = form.addField({
        id: "date_from_field",
        type: serverWidget.FieldType.DATE,
        label: "DATE FROM",
        container: "parameters_group",
      });

      if (datefrom) {
        var date = new Date(parseInt(datefrom) + 7 * 60 * 60 * 1000);
        var day = ("0" + date.getUTCDate()).slice(-2);
        var month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are zero-indexed
        var year = date.getFullYear().toString().slice(-2);
        dateFromString = day + "/" + month + "/" + year;

        dateFromfield.defaultValue = dateFromString;
      }

      let dateTofield = form.addField({
        id: "date_to_field",
        type: serverWidget.FieldType.DATE,
        label: "DATE TO",
        container: "parameters_group",
      });

      if (dateto) {
        var date = new Date(parseInt(dateto) + 7 * 60 * 60 * 1000);

        var day = ("0" + date.getUTCDate()).slice(-2);
        var month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are zero-indexed
        var year = date.getFullYear().toString().slice(-2);
        dateToString = day + "/" + month + "/" + year;

        dateTofield.defaultValue = dateToString;
      }

      let filter_invoice = [
        ["type", "anyof", "CustInvc"],
        "AND",
        ["mainline", "is", "T"],
        "AND",
        ["custbody_vsc_ar_invoice_type", "anyof", "1"],
      ];

      if (subsidiaryId) {
        filter_invoice.push("AND");
        filter_invoice.push(["subsidiary", "anyof", subsidiaryId]);
      }
      if (dateFromString && dateToString) {
        filter_invoice.push("AND");
        filter_invoice.push([
          "trandate",
          "within",
          dateFromString,
          dateToString,
        ]);
      }
      if (customerId) {
        filter_invoice.push("AND");
        filter_invoice.push(["name", "anyof", customerId]);
      }

      let resultInvoice = searchInvoice(filter_invoice);
      log.debug("🚀 ~ onRequest ~ resultInvoice:", resultInvoice);

      resultInvoice.forEach((element) => {
        invoice.addSelectOption({
          value: element.internalid,
          text: element.documentNumber,
        });
      });

      var button = form.addButton({
        id: "buttonid",
        label: "Submit",
        functionName: `printReport()`,
      });

      context.response.writePage(form);
    }
  }

  function searchInvoice(obj) {
    try {
      log.debug("obj", obj);
      var customrecord_search_obj = search.create({
        type: "invoice",
        filters: obj,
        columns: [
          "internalid",
          search.createColumn({ name: "invoicenum", label: "Invoice Number" }),
          search.createColumn({ name: "trandate", label: "Date" }),
          search.createColumn({ name: "tranid", label: "Document Number" }),
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
          documentNumber: e.getValue({
            name: "tranid",
            label: "Document Number",
          }),
          trandate: e.getValue({
            name: "trandate",
            label: "Date",
          }),
        };
      });

      return results;
    } catch (error) {
      return [];
    }
  }

  function searchCustomerBySubsidiry(obj) {
    try {
      var customrecord_search_obj = search.create({
        type: "customer",
        filters: [["subsidiary", "anyof", obj.id]],
        columns: [
          "internalid",
          search.createColumn({ name: "altname", label: "Name" }),
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
          name: e.getValue({
            name: "altname",
            label: "Name",
          }),
        };
      });

      return results;
    } catch (error) {
      return [];
    }
  }

  return {
    onRequest: onRequest,
  };
});
