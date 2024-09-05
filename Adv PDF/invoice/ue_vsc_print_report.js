/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define([], function () {
  function beforeLoad(context) {
    try {
      const rec = context.newRecord;
      const form = context.form;
      if (context.type == context.UserEventType.VIEW) {
        form.clientScriptModulePath = "./cs_vsc_form_report_invoice.js";
        form.addButton({
          id: "custpage_print_invoice",
          label: "Print Invoice",
          functionName: `printReportInvoice(${rec.id})`,
        });
      }
    } catch (error) {
      log.debug("🚀 ~ beforeLoad ~ error:", error);
    }
  }

  function beforeSubmit(context) {}

  function afterSubmit(context) {}

  return {
    beforeLoad: beforeLoad,
    beforeSubmit: beforeSubmit,
    afterSubmit: afterSubmit,
  };
});
