import Vue from 'vue'
import { capitalize, uniq } from 'lodash'

import AutomationBase from './AutomationBase'
import AutomationConfigurator from './AutomationConfigurator'
import CalendarBase from './CalendarBase'
import CalendarConfigurator from './CalendarConfigurator'
import ChartBase from './ChartBase'
import ChartConfigurator from './ChartConfigurator'
import ContentBase from './ContentBase'
import ContentConfigurator from './ContentConfigurator'
import FileBase from './FileBase'
import FileConfigurator from './FileConfigurator'
import IFrameBase from './IFrameBase'
import IFrameConfigurator from './IFrameConfigurator'
import RecordBase from './RecordBase'
import RecordConfigurator from './RecordConfigurator'
import RecordEditor from './RecordEditor'
import RecordListBase from './RecordListBase'
import RecordListConfigurator from './RecordListConfigurator'
import RecordOrganizerBase from './RecordOrganizerBase'
import RecordOrganizerConfigurator from './RecordOrganizerConfigurator'
import SocialFeedBase from './SocialFeedBase'
import SocialFeedConfigurator from './SocialFeedConfigurator'
import RecordLinesBase from './RecordLinesBase'
import RecordLinesConfigurator from './RecordLinesConfigurator'
import RecordLinesEditor from './RecordLinesEditor'

/**
 * List of all known page block components
 *
 */
const Registry = {
  AutomationBase,
  AutomationConfigurator,
  CalendarBase,
  CalendarConfigurator,
  ChartBase,
  ChartConfigurator,
  ContentBase,
  ContentConfigurator,
  FileBase,
  FileConfigurator,
  IFrameBase,
  IFrameConfigurator,
  RecordBase,
  RecordConfigurator,
  RecordEditor,
  RecordListBase,
  RecordListConfigurator,
  RecordOrganizerBase,
  RecordOrganizerConfigurator,
  SocialFeedBase,
  SocialFeedConfigurator,
  RecordLinesBase,
  RecordLinesConfigurator,
  RecordLinesEditor,
}

const defaultMode = 'Base'

function GetComponent ({ block, mode = defaultMode }) {
  if (!block) {
    throw new Error('block prop missing')
  }

  const { kind } = block
  for (mode of uniq([capitalize(mode), defaultMode])) {
    const cmpName = kind + mode
    if (Object.hasOwnProperty.call(Registry, cmpName)) {
      return Registry[cmpName]
    }
  }

  throw new Error('unknown block kind: ' + kind)
}

/**
 * Main entry point for PageBlock components
 *
 * It will look for combination of page block kind & mode (from props)
 * and render the component
 */
export default Vue.component('page-block', {
  functional: true,

  render (ce, ctx) {
    return ce(GetComponent(ctx.props), ctx.data, ctx.children)
  },
})
