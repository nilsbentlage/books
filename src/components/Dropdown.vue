<template>
  <Popover
    :show-popup="isShown"
    :hide-arrow="true"
    :placement="right ? 'bottom-end' : 'bottom-start'"
  >
    <div
      slot="target"
      class="h-full"
      v-on-outside-click="() => (isShown = false)"
    >
      <slot
        :toggleDropdown="toggleDropdown"
        :highlightItemUp="highlightItemUp"
        :highlightItemDown="highlightItemDown"
        :selectHighlightedItem="selectHighlightedItem"
      ></slot>
    </div>
    <div slot="content" class="bg-white rounded w-full min-w-40">
      <div class="p-1 max-h-64 overflow-auto text-sm">
        <div v-if="isLoading" class="p-2 text-gray-600 italic">
          {{ t('Loading...') }}
        </div>
        <div
          v-if="!isLoading && dropdownItems.length === 0"
          class="p-2 text-gray-600 italic"
        >
          {{ getEmptyMessage() }}
        </div>
        <template v-else>
          <div v-for="d in dropdownItems" :key="d.label">
            <div
              v-if="d.isGroup"
              class="
                px-2
                pt-3
                pb-1
                text-xs
                uppercase
                text-gray-700
                font-semibold
                tracking-wider
              "
            >
              {{ d.label }}
            </div>
            <a
              v-else
              ref="items"
              class="
                block
                p-2
                rounded-md
                mt-1
                first:mt-0
                cursor-pointer
                truncate
              "
              :class="d.index === highlightedIndex ? 'bg-gray-100' : ''"
              @mouseenter="highlightedIndex = d.index"
              @mouseleave="highlightedIndex = -1"
              @mousedown.prevent
              @click="selectItem(d)"
            >
              <component :is="d.component" v-if="d.component" />
              <template v-else>{{ d.label }}</template>
            </a>
          </div>
        </template>
      </div>
    </div>
  </Popover>
</template>

<script>
import Popover from './Popover';
import uniq from 'lodash/uniq';

export default {
  name: 'Dropdown',
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    groups: {
      type: Array,
      default: null,
    },
    right: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    df: {
      default: null,
    },
    doc: {
      default: null,
    },
  },
  components: {
    Popover,
  },
  data() {
    return {
      isShown: false,
      highlightedIndex: -1,
    };
  },
  computed: {
    sortedGroups() {
      if (Array.isArray(this.groups)) {
        return this.groups;
      }
      let groupNames = uniq(
        this.items
          .map((d) => d.group)
          .filter(Boolean)
          .sort()
      );
      if (groupNames.length > 0) {
        return groupNames;
      }
      return null;
    },
    dropdownItems() {
      if (this.sortedGroups) {
        let itemsByGroup = {};

        for (let item of this.items) {
          let group = item.group || '';
          itemsByGroup[group] = itemsByGroup[group] || [];
          itemsByGroup[group].push(item);
        }

        let items = [];
        let i = 0;
        for (let group of this.sortedGroups) {
          let groupItems = itemsByGroup[group];
          groupItems = groupItems.map((d) => {
            d.index = i;
            i++;
            return d;
          });
          items = items.concat(
            {
              label: group,
              isGroup: true,
            },
            groupItems
          );
        }

        return items;
      }

      return this.items.map((d, i) => {
        d.index = i;
        return d;
      });
    },
  },
  methods: {
    getEmptyMessage() {
      const { emptyMessage } = this.df ?? {};
      if (typeof emptyMessage === 'function') {
        return this.t(emptyMessage(this.doc));
      } else if (emptyMessage) {
        return this.t(emptyMessage);
      }
      return this.t('Empty');
    },
    selectItem(d) {
      if (d.action) {
        d.action();
      }
    },
    toggleDropdown(flag) {
      if (flag == null) {
        this.isShown = !this.isShown;
      } else {
        this.isShown = Boolean(flag);
      }
    },
    selectHighlightedItem() {
      if (![-1, this.items.length].includes(this.highlightedIndex)) {
        // valid selection
        let item = this.items[this.highlightedIndex];
        this.selectItem(item);
      }
    },
    highlightItemUp() {
      this.highlightedIndex -= 1;
      if (this.highlightedIndex < 0) {
        this.highlightedIndex = 0;
      }
      this.$nextTick(() => {
        let index = this.highlightedIndex;
        if (index !== 0) {
          index -= 1;
        }
        this.scrollToHighlighted();
      });
    },
    highlightItemDown() {
      this.highlightedIndex += 1;
      if (this.highlightedIndex > this.items.length) {
        this.highlightedIndex = this.items.length;
      }

      this.$nextTick(() => {
        this.scrollToHighlighted();
      });
    },
    scrollToHighlighted() {
      let highlightedElement = this.$refs.items[this.highlightedIndex];
      highlightedElement &&
        highlightedElement.scrollIntoView({ block: 'nearest' });
    },
  },
};
</script>
