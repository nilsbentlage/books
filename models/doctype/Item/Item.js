import frappe from 'frappe';
import { t } from 'frappe';

export default {
  name: 'Item',
  doctype: 'DocType',
  isSingle: 0,
  regional: 1,
  keywordFields: ['name', 'description'],
  fields: [
    {
      fieldname: 'name',
      label: 'Item Name',
      fieldtype: 'Data',
      placeholder: 'Item Name',
      required: 1,
    },
    {
      fieldname: 'image',
      label: 'Image',
      fieldtype: 'AttachImage',
    },
    {
      fieldname: 'description',
      label: 'Description',
      placeholder: 'Item Description',
      fieldtype: 'Text',
    },
    {
      fieldname: 'unit',
      label: 'Unit Type',
      fieldtype: 'Select',
      placeholder: 'Unit Type',
      default: 'Unit',
      options: ['Unit', 'Kg', 'Gram', 'Hour', 'Day'],
    },
    {
      fieldname: 'itemType',
      label: 'Type',
      placeholder: 'Type',
      fieldtype: 'Select',
      default: 'Product',
      options: ['Product', 'Service'],
    },
    {
      fieldname: 'incomeAccount',
      label: 'Income',
      fieldtype: 'Link',
      target: 'Account',
      placeholder: 'Income',
      required: 1,
      disableCreation: true,
      getFilters: () => {
        return {
          isGroup: 0,
          rootType: 'Income',
        };
      },
      formulaDependsOn: ['itemType'],
      async formula(doc) {
        let accountName = 'Service';
        if (doc.itemType === 'Product') {
          accountName = 'Sales';
        }

        const accountExists = await frappe.db.exists('Account', accountName);
        return accountExists ? accountName : '';
      },
    },
    {
      fieldname: 'expenseAccount',
      label: 'Expense',
      fieldtype: 'Link',
      target: 'Account',
      placeholder: 'Expense',
      required: 1,
      disableCreation: true,
      getFilters: () => {
        return {
          isGroup: 0,
          rootType: 'Expense',
        };
      },
      formulaDependsOn: ['itemType'],
      async formula() {
        const cogs = await frappe.db
          .knex('Account')
          .where({ accountType: 'Cost of Goods Sold' });
        if (cogs.length === 0) {
          return '';
        } else {
          return cogs[0].name;
        }
      },
    },
    {
      fieldname: 'tax',
      label: 'Tax',
      fieldtype: 'Link',
      target: 'Tax',
      placeholder: 'Tax',
    },
    {
      fieldname: 'rate',
      label: 'Rate',
      fieldtype: 'Currency',
      validate(value) {
        if (value.lte(0)) {
          throw new frappe.errors.ValidationError(
            'Rate must be greater than 0'
          );
        }
      },
    },
  ],
  quickEditFields: [
    'rate',
    'unit',
    'itemType',
    'tax',
    'description',
    'incomeAccount',
    'expenseAccount',
  ],
  actions: [
    {
      label: t('New Invoice'),
      condition: (doc) => !doc.isNew(),
      action: async (doc, router) => {
        const invoice = await frappe.getNewDoc('SalesInvoice');
        invoice.append('items', {
          item: doc.name,
          rate: doc.rate,
          tax: doc.tax,
        });
        router.push(`/edit/SalesInvoice/${invoice.name}`);
      },
    },
    {
      label: t('New Bill'),
      condition: (doc) => !doc.isNew(),
      action: async (doc, router) => {
        const invoice = await frappe.getNewDoc('PurchaseInvoice');
        invoice.append('items', {
          item: doc.name,
          rate: doc.rate,
          tax: doc.tax,
        });
        router.push(`/edit/PurchaseInvoice/${invoice.name}`);
      },
    },
  ],
};
