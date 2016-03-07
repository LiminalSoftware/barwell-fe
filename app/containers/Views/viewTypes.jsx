import TabularInlineConfig from "./Tabular/InlineConfig/index.jsx"
import TabularMain from "./Tabular/Main/index.jsx"
import TabularGroomer from "./Tabular/groom"

import CalendarMain from "./Calendar/Main/index.jsx"
import CalendarGroomer from "./Calendar/groom.jsx"

import CubeInlineConfig from "./Cube/InlineConfig/index.jsx"
import CubeMain from "./Cube/Main/index.jsx"
import CubeGroomer from "./Cube/groom"


var viewTypes = {
	Tabular: {
		type: "Tabular",
		icon: "icon-grid",
		groomer: TabularGroomer,
		mainElement: TabularMain,
		inlineConfigElement: TabularInlineConfig,
		category: "Tables",
		description: "Simple, tabular format. Each row represents a single record."
	},
	Cube: {
		type: "Cube",
		icon: "icon-cube",
		groomer: CubeGroomer,
		mainElement: CubeMain,
		inlineConfigElement: CubeInlineConfig,
		category: "Tables",
		description: "Dynamic table with configurable row and column grouping."
	},
	Calendar: {
		type: "Calendar",
		icon: "icon-calendar-full",
		mainElement: CalendarMain,
		groomer: CalendarGroomer,
		category: "Dates and Times",
		description: "Lays out your data on a calendar."
	},
	Timeline : {
		type: "Timeline",
		icon: "icon-road",
		category: "Dates and Times",
		description: "Also called a Gannt chart.  Shows events and activities along a horizontal time axis."
	}
}

export default viewTypes
