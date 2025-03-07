<template>
  <div class="flex flex-col">
    <PageHeader>
      <BackLink slot="title" />
      <template slot="actions" v-if="doc">
        <StatusBadge :status="status" />
        <DropdownWithActions class="ml-2" :actions="actions" />
        <Button
          v-if="doc._notInserted || doc._dirty"
          type="primary"
          class="text-white text-xs ml-2"
          @click="onSaveClick"
        >
          {{ t('Save') }}
        </Button>
        <Button
          v-if="!doc._dirty && !doc._notInserted && !doc.submitted"
          type="primary"
          class="text-white text-xs ml-2"
          @click="onSubmitClick"
        >
          {{ t('Submit') }}
        </Button>
      </template>
    </PageHeader>
    <div v-if="doc" class="flex justify-center flex-1 mb-8 mt-2">
      <div
        class="border rounded-lg shadow h-full flex flex-col justify-between"
        style="width: 600px"
      >
        <div>
          <div class="mt-8 px-6">
            <h1 class="text-2xl font-semibold">
              {{ doc._notInserted ? t('New Journal Entry') : doc.name }}
            </h1>
            <div class="flex justify-between mt-2">
              <div class="w-1/3">
                <FormControl
                  :df="meta.getField('entryType')"
                  :value="doc.entryType"
                  placeholder="Entry Type"
                  @change="(value) => doc.set('entryType', value)"
                  input-class="bg-gray-100 px-3 py-2 text-base"
                  :read-only="doc.submitted"
                  :class="doc.submitted && 'pointer-events-none'"
                />
                <FormControl
                  class="mt-2"
                  :df="meta.getField('date')"
                  :value="doc.date"
                  :placeholder="'Date'"
                  @change="(value) => doc.set('date', value)"
                  input-class="bg-gray-100 px-3 py-2 text-base"
                  :read-only="doc.submitted"
                  :class="doc.submitted && 'pointer-events-none'"
                />
              </div>
              <div class="w-1/3">
                <FormControl
                  :df="meta.getField('referenceNumber')"
                  :value="doc.referenceNumber"
                  :placeholder="'Reference Number'"
                  @change="(value) => doc.set('referenceNumber', value)"
                  input-class="bg-gray-100 p-2 text-base"
                  :read-only="doc.submitted"
                  :class="doc.submitted && 'pointer-events-none'"
                />
                <FormControl
                  class="mt-2"
                  :df="meta.getField('referenceDate')"
                  :value="doc.referenceDate"
                  :placeholder="'Reference Date'"
                  @change="(value) => doc.set('referenceDate', value)"
                  input-class="bg-gray-100 px-3 py-2 text-base"
                  :read-only="doc.submitted"
                  :class="doc.submitted && 'pointer-events-none'"
                />
              </div>
            </div>
          </div>
          <div class="mt-2 px-6 text-base">
            <FormControl
              :df="meta.getField('accounts')"
              :value="doc.accounts"
              :showHeader="true"
              :max-rows-before-overflow="4"
              @change="(value) => doc.set('accounts', value)"
              :read-only="doc.submitted"
            />
          </div>
        </div>
        <div class="px-6 mb-6">
          <div
            class="grid items-center border-t pt-3 pr-2"
            style="grid-template-columns: 1.3fr 1fr 1fr"
          >
            <div class="text-sm">
              <FormControl
                :df="meta.getField('userRemark')"
                :value="doc.userRemark"
                @change="(value) => doc.set('userRemark', value)"
                :class="doc.submitted && 'pointer-events-none'"
                :read-only="doc.submitted"
              />
            </div>
            <div class="text-right font-semibold text-green-600 px-3">
              {{ totalDebit }}
            </div>
            <div class="text-right font-semibold text-red-600 px-3">
              {{ totalCredit }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import frappe from 'frappe';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import DropdownWithActions from '@/components/DropdownWithActions';
import FormControl from '@/components/Controls/FormControl';
import BackLink from '@/components/BackLink';
import StatusBadge from '@/components/StatusBadge';
import {
  showMessageDialog,
  getActionsForDocument,
  routeTo,
} from '@/utils';
import { handleErrorWithDialog } from '../errorHandling';

export default {
  name: 'JournalEntryForm',
  props: ['name'],
  components: {
    PageHeader,
    Button,
    DropdownWithActions,
    StatusBadge,
    FormControl,
    BackLink,
  },
  provide() {
    return {
      doctype: 'JournalEntry',
      name: this.name,
    };
  },
  data() {
    return {
      doctype: 'JournalEntry',
      doc: null,
    };
  },
  computed: {
    meta() {
      return frappe.getMeta(this.doctype);
    },
    status() {
      if (this.doc._notInserted || !this.doc.submitted) {
        return 'Draft';
      }

      return '';
    },
    totalDebit() {
      let value = 0;
      if (this.doc.accounts) {
        value = this.doc.getSum('accounts', 'debit');
      }
      return frappe.format(value, 'Currency');
    },
    totalCredit() {
      let value = 0;
      if (this.doc.accounts) {
        value = this.doc.getSum('accounts', 'credit');
      }
      return frappe.format(value, 'Currency');
    },
    actions() {
      return getActionsForDocument(this.doc);
    },
  },
  async mounted() {
    try {
      this.doc = await frappe.getDoc(this.doctype, this.name);
      window.je = this.doc;
    } catch (error) {
      if (error instanceof frappe.errors.NotFoundError) {
        routeTo(`/list/${this.doctype}`);
        return;
      }
      this.handleError(error);
    }
  },
  methods: {
    async onSaveClick() {
      return this.doc.insertOrUpdate().catch(this.handleError);
    },
    async onSubmitClick() {
      showMessageDialog({
        message: this.t('Are you sure you want to submit this Journal Entry?'),
        buttons: [
          {
            label: this.t('Yes'),
            action: () => {
              this.doc.submit().catch(this.handleError);
            },
          },
          {
            label: this.t('No'),
            action() {},
          },
        ],
      });
    },
    handleError(e) {
      handleErrorWithDialog(e, this.doc);
    },
  },
};
</script>
