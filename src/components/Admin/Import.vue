<template>
  <b-form ref="importForm" @submit.prevent class="import-form">
    <b-form-group :label="$t(`${type}.import`)">
      <b-input-group>
        <b-form-file @change="loadFile" />
        <b-button v-if="importObj && !processing" variant="dark" @click="openModal">
          {{ $t('general.label.import') }}
        </b-button>
        <b-button v-if="importObj && processing" variant="dark" @click="cancelImport">
          {{ $t('general.label.cancel') }}
        </b-button>
        <h6 v-if="processing" class="my-auto ml-3 ">
          {{ $t('general.label.processing') }}
        </h6>
      </b-input-group>
    </b-form-group>
    <b-modal v-if="importObj" size="lg" v-model="show" id="importModal" :title="$t(`${type}.import`)">
      <b-container class="p-0">
        <b-row no-gutters class="mb-3">
          <b-button variant="secondary" @click="selectAll(true)">
            {{ $t('field.selector.selectAll') }}
          </b-button>
          <b-button class="ml-2" variant="secondary" @click="selectAll(false)">
            {{ $t('field.selector.unselectAll') }}
          </b-button>
        </b-row>
        <b-row no-gutters>
          <b-col cols="3" v-for="(o, index) in importObj.list" :key="index" class="form-check">
              <b-form-checkbox v-model="o.import">
                {{ o.name || o.title }}
              </b-form-checkbox>
          </b-col>
        </b-row>
      </b-container>
      <div slot="modal-footer">
        <b-button
            :disabled="!importObj.list.filter(i => i.import).length > 0"
            variant="primary"
            @click="jsonImport(importObj)">

            {{ $t('general.label.import') }}
        </b-button>
      </div>
    </b-modal>
  </b-form>
</template>

<script>
import { mapGetters } from 'vuex'
import Chart from '../Chart'
import { compose } from '@cortezaproject/corteza-js'

export default {
  props: {
    namespace: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },

  data () {
    return {
      importObj: null,
      importErr: null,
      processing: false,
      show: false,
      classes: {
        module: compose.Module,
        chart: Chart,
        // 'trigger': Trigger,
      },
    }
  },

  computed: {
    ...mapGetters({
      modules: 'module/set',
    }),
  },

  methods: {
    async jsonImport ({ list, type }) {
      this.processing = true
      this.show = false
      const { namespaceID } = this.namespace
      const ItemClass = this.classes[type]
      try {
        for (let item of list.filter(i => i.import)) {
          if (this.importObj) {
            item = new ItemClass(item).import(this.getModuleID)
            item.namespaceID = namespaceID
            await this.$store.dispatch(`${this.type}/create`, item)
          } else {
            break
          }
        }
        this.raiseSuccessAlert(this.$t('notification.import.successful'))
      } catch (e) {
        this.raiseWarningAlert(this.$t('notification.import.failed'))
      }
      this.cancelImport()
    },

    getModuleID (moduleName) {
      // find module, replaceID
      const matchedModules = this.modules.filter(m => m.name === moduleName)
      if (matchedModules.length > 0) {
        return matchedModules[0].moduleID
      } else {
        return null
      }
    },

    selectAll (selectAll) {
      this.importObj.list = this.importObj.list.map(i => {
        i.import = selectAll && true
        return i
      })
    },

    openModal () {
      if (this.importObj.type === this.type) {
        this.show = true
      } else {
        this.raiseWarningAlert(this.$t('notification.import.typeMissmatch', { type1: this.importObj.type, type2: this.type }))
        this.importObj = null
      }
    },

    cancelImport () {
      this.importObj = null
      this.processing = false
      this.$refs.importForm.reset()
    },

    loadFile (e) {
      var file = e.target.files[0]
      if (file) {
        this.processing = true
        var reader = new FileReader()
        reader.readAsText(file)
        reader.onload = (evt) => {
          try {
            this.importObj = JSON.parse(evt.target.result)
            this.importObj.list = this.importObj.list.map(i => {
              return { import: true, ...i }
            })
          } catch (err) {
            this.raiseWarningAlert(err.message)
          } finally {
            this.processing = false
          }
        }
        reader.onerror = (evt) => {
          this.raiseWarningAlert(this.$t('notification.import.errorReading'))
          this.processing = false
        }
      }
    },
  },
}
</script>
