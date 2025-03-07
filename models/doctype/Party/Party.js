import frappe, { t } from 'frappe';

export default {
  name: 'Party',
  label: 'Party',
  regional: 1,
  keywordFields: ['name'],
  fields: [
    {
      fieldname: 'name',
      label: 'Name',
      fieldtype: 'Data',
      required: 1,
      placeholder: 'Full Name',
    },
    {
      fieldname: 'image',
      label: 'Image',
      fieldtype: 'AttachImage',
    },
    {
      fieldname: 'customer',
      label: 'Is Customer',
      fieldtype: 'Check',
    },
    {
      fieldname: 'supplier',
      label: 'Is Supplier',
      fieldtype: 'Check',
    },
    {
      fieldname: 'defaultAccount',
      label: 'Default Account',
      fieldtype: 'Link',
      target: 'Account',
      getFilters: (query, doc) => {
        return {
          isGroup: 0,
          accountType: doc.customer ? 'Receivable' : 'Payable',
        };
      },
      async formula(doc) {
        let accountName = 'Debtors'; // if Party is a Customer
        if (doc.supplier) {
          accountName = 'Creditors';
        }

        const accountExists = await frappe.db.exists('Account', accountName);
        return accountExists ? accountName : '';
      },
    },
    {
      fieldname: 'outstandingAmount',
      label: 'Outstanding Amount',
      fieldtype: 'Currency',
    },
    {
      fieldname: 'currency',
      label: 'Currency',
      fieldtype: 'Link',
      target: 'Currency',
      placeholder: 'INR',
      formula: () => frappe.AccountingSettings.currency,
    },
    {
      fieldname: 'email',
      label: 'Email',
      fieldtype: 'Data',
      placeholder: 'john@doe.com',
      validate: {
        type: 'email',
      },
    },
    {
      fieldname: 'phone',
      label: 'Phone',
      fieldtype: 'Data',
      placeholder: 'Phone',
      validate: {
        type: 'phone',
      },
    },
    {
      fieldname: 'address',
      label: 'Address',
      fieldtype: 'Link',
      target: 'Address',
      placeholder: t('Click to create'),
      inline: true,
    },
    {
      fieldname: 'addressDisplay',
      label: 'Address Display',
      fieldtype: 'Text',
      readOnly: true,
      formula: (doc) => {
        if (doc.address) {
          return doc.getFrom('Address', doc.address, 'addressDisplay');
        }
      },
    },
  ],

  quickEditFields: ['email', 'phone', 'address', 'defaultAccount', 'currency'],
};
