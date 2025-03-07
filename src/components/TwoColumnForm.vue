<template>
  <div class="text-sm" :class="{ 'border-t': !noBorder }">
    <template v-for="df in formFields">
      <FormControl
        :key="df.fieldname"
        v-if="df.fieldtype === 'Table'"
        ref="controls"
        size="small"
        :df="df"
        :value="doc[df.fieldname]"
        :read-only="evaluateReadOnly(df)"
        @change="(value) => onChange(df, value)"
      />
      <template v-else>
        <template v-if="inlineEditField === df && inlineEditDoc">
          <div class="border-b" :key="df.fieldname">
            <TwoColumnForm
              ref="inlineEditForm"
              :doc="inlineEditDoc"
              :fields="inlineEditFields"
              :column-ratio="columnRatio"
              :no-border="true"
              :focus-first-input="true"
              :autosave="false"
              @error="(msg) => $emit('error', msg)"
            />
            <div class="flex px-4 pb-2">
              <Button
                class="w-1/2 text-gray-900"
                @click="inlineEditField = null"
              >
                {{ t('Cancel') }}
              </Button>
              <Button
                type="primary"
                class="ml-2 w-1/2 text-white"
                @click="() => saveInlineEditDoc(df)"
              >
                {{ df.inlineSaveText || t('Save') }}
              </Button>
            </div>
          </div>
        </template>
        <div
          :key="df.fieldname"
          v-else
          class="grid"
          :class="{ 'border-b': !noBorder }"
          :style="style"
        >
          <div class="py-2 pl-4 flex text-gray-600">
            <div class="py-1">
              {{ df.label }}
            </div>
          </div>
          <div
            class="py-2 pr-4"
            @click="activateInlineEditing(df)"
            :class="{
              'pl-2': df.fieldtype === 'AttachImage',
            }"
          >
            <FormControl
              ref="controls"
              size="small"
              :df="df"
              :value="
                df.inline && doc.getLink(df.fieldname)
                  ? doc.getLink(df.fieldname)[
                      doc.getLink(df.fieldname).meta.inlineEditDisplayField ||
                        'name'
                    ]
                  : doc[df.fieldname]
              "
              :class="{ 'p-2': df.fieldtype === 'Check' }"
              :read-only="evaluateReadOnly(df)"
              @change="(value) => onChange(df, value)"
              @focus="activateInlineEditing(df)"
              @new-doc="(newdoc) => onChange(df, newdoc.name)"
            />
            <div
              class="text-sm text-red-600 mt-2 pl-2"
              v-if="errors[df.fieldname]"
            >
              {{ errors[df.fieldname] }}
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
<script>
import frappe from 'frappe';
import FormControl from '@/components/Controls/FormControl';
import Button from '@/components/Button';
import { handleErrorWithDialog, getErrorMessage } from '../errorHandling';

let TwoColumnForm = {
  name: 'TwoColumnForm',
  props: {
    doc: Object,
    fields: Array,
    autosave: Boolean,
    columnRatio: {
      type: Array,
      default: () => [1, 1],
    },
    emitChange: {
      type: Boolean,
      default: false,
    },
    noBorder: Boolean,
    focusFirstInput: Boolean,
  },
  data() {
    return {
      inlineEditField: null,
      inlineEditDoc: null,
      inlineEditFields: null,
      inlineEditDisplayField: null,
      errors: {},
    };
  },
  provide() {
    return {
      doctype: this.doc.doctype,
      name: this.doc.name,
      doc: this.doc,
    };
  },
  components: {
    FormControl,
    Button,
    TwoColumnForm: () => TwoColumnForm,
  },
  mounted() {
    if (this.focusFirstInput) {
      this.$refs['controls'][0].focus();
    }
  },
  methods: {
    evaluateBoolean(fieldProp, defaultValue) {
      const type = typeof fieldProp;
      switch (type) {
        case 'undefined':
          return defaultValue;
        case 'function':
          return fieldProp(this.doc);
        default:
          return !!fieldProp;
      }
    },
    evaluateReadOnly(df) {
      if (this.submitted) {
        return true;
      }
      return this.evaluateBoolean(df.readOnly, false);
    },
    evaluateHidden(df) {
      return this.evaluateBoolean(df.hidden, false);
    },
    onChange(df, value) {
      if (value == null || df.inline) {
        return;
      }

      let oldValue = this.doc.get(df.fieldname);

      this.$set(this.errors, df.fieldname, null);
      if (oldValue === value) {
        return;
      }

      if (this.emitChange) {
        this.$emit('change', df, value, oldValue);
      }

      // handle rename
      if (this.autosave && df.fieldname === 'name' && !this.doc.isNew()) {
        return this.doc.rename(value);
      }

      this.onChangeCommon(df, value);
    },
    onChangeCommon(df, value) {
      this.doc.set(df.fieldname, value).catch((e) => {
        // set error message for this field
        this.$set(this.errors, df.fieldname, getErrorMessage(e, this.doc));
      });

      if (this.autosave && this.doc._dirty && !this.doc.isNew()) {
        if (df.fieldtype === 'Table') {
          return;
        }
        this.doc.update();
      }
    },
    insertOrUpdate() {
      return this.doc.insertOrUpdate().catch(this.handleError);
    },
    insert() {
      return this.doc.insert().catch(this.handleError);
    },
    submit() {
      return this.doc.submit().catch(this.handleError);
    },
    handleError(e) {
      handleErrorWithDialog(e, this.doc);
    },
    async activateInlineEditing(df) {
      if (!df.inline) {
        return;
      }

      this.inlineEditField = df;
      if (!this.doc[df.fieldname]) {
        this.inlineEditDoc = await frappe.getNewDoc(df.target);
        this.inlineEditDoc.once('afterInsert', () => {
          this.onChangeCommon(df, this.inlineEditDoc.name);
        });
      } else {
        this.inlineEditDoc = this.doc.getLink(df.fieldname);
      }

      this.inlineEditDisplayField =
        this.doc.meta.inlineEditDisplayField || 'name';
      this.inlineEditFields = frappe.getMeta(df.target).getQuickEditFields();
    },
    async saveInlineEditDoc(df) {
      if (!this.inlineEditDoc) {
        return;
      }
      await this.$refs.inlineEditForm[0].insertOrUpdate();
      await this.doc.loadLinks();

      if (this.emitChange && df.inline) {
        this.$emit('change', df.inlineEditField);
      }

      this.inlineEditField = null;
    },
  },
  computed: {
    formFields() {
      return (this.fields || this.doc.meta.getQuickEditFields()).filter(
        (df) => !this.evaluateHidden(df)
      );
    },
    style() {
      let templateColumns = (this.columnRatio || [1, 1])
        .map((r) => `${r}fr`)
        .join(' ');
      return {
        'grid-template-columns': templateColumns,
      };
    },
    submitted() {
      return Boolean(this.doc.meta.isSubmittable && this.doc.submitted);
    },
  },
};

export default TwoColumnForm;
</script>
