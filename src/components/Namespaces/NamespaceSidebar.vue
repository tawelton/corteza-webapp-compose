<template>
  <c-sidebar position="left"
           name="ns-sidebar"
           class="bg-white overflow-auto"
           v-bind="$props"
           v-on="$listeners">

    <b-list-group-item class="p-2 sticky-top"
                       slot="header">

      <b-form-input placeholder="Search"
                    :formatter="preProcess"
                    v-model="filter" />

    </b-list-group-item>

    <div v-if="filteredNamespaces.pinned.length"
         class="border-bottom">

      <b-list-group-item v-for="ns in filteredNamespaces.pinned"
                        :key="ns.namespaceID"
                        :to="{ name: 'namespace', params: ns }"
                        class="p-2"
                        active-class="active text-primary border-top-0 border-bottom-0 disabled"
                        @click="removePin(ns)">

        <span class="text-truncate d-block">
              {{ ns.name }}
        </span>
      </b-list-group-item>
    </div>

    <b-list-group-item v-for="ns in filteredNamespaces.regular"
                        :key="ns.namespaceID"
                        :to="{ name: 'namespace', params: ns }"
                        class="p-2"
                        active-class="active text-primary border-top-0 border-bottom-0 disabled">

      <span class="text-truncate d-block">
            {{ ns.name }}
      </span>
    </b-list-group-item>
  </c-sidebar>
</template>

<script>
import { compose } from '@cortezaproject/corteza-js'
import { components } from '@cortezaproject/corteza-vue'
const { CSidebar } = components

export default {
  components: {
    CSidebar,
  },
  props: {
    namespaces: {
      type: Array,
      required: true,
    },

    namespace: {
      type: compose.Namespace,
      required: false,
    },

    visible: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data () {
    return {
      filter: null,
      pinned: {},
    }
  },

  computed: {
    filteredNamespaces () {
      const rtr = {
        pinned: [],
        regular: [],
      }
      this.namespaces.forEach(ns => {
        if (this.pinned[ns.namespaceID]) {
          rtr.pinned.push(ns)
        } else if (!this.filter || `${ns.name}${ns.slug}${ns.namespaceID}`.toLowerCase().indexOf(this.filter) > -1) {
          rtr.regular.push(ns)
        }
      })

      // DSC order
      const sorter = (a, b) => {
        return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
      }

      return {
        pinned: rtr.pinned.sort(sorter),
        regular: rtr.regular.sort(sorter),
      }
    },
  },

  created () {
    this.$root.$on('namespaces.pin', this.pinNamespace)
  },
  beforeDestroy () {
    this.$root.$off('namespaces.pin', this.pinNamespace)
  },

  methods: {
    preProcess (value) {
      return (value || '').toLowerCase()
    },

    removePin ({ namespaceID }) {
      this.$delete(this.pinned, namespaceID)
    },

    pinNamespace (namespaceID) {
      this.$set(this.pinned, namespaceID, true)
    },
  },
}
</script>

<style scoped lang="scss">
  aside {
    width: 200px;

    .list-group-item {
      &.active {
        border-right: 3px solid $primary;
        background-color: rgba($primary, 0.15);
      }
    }
  }
</style>
