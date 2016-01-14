import TabularConfig from "./Tabular/Config/index.jsx"
import TabularInlineConfig from "./Tabular/InlineConfig/index.jsx"
import TabularMain from "./Tabular/Main/index.jsx"
import TabularGroomer from "./Tabular/groom"

import CalendarConfig from "./Calendar/Config/index.jsx"
import CalendarMain from "./Calendar/Main/index.jsx"
import CalendarGroomer from "./Calendar/groom.jsx"

import CubeConfig from "./Cube/Config/index.jsx"
import CubeInlineConfig from "./Cube/InlineConfig/index.jsx"
import CubeMain from "./Cube/Main/index.jsx"
import CubeGroomer from "./Cube/groom"


var viewTypes = {
	Tabular: {
		type: "Tabular",
		icon: "icon-db-datasheet",
		groomer: TabularGroomer,
		mainElement: TabularMain,
		configElement: TabularConfig,
		inlineConfigElement: TabularInlineConfig,
		category: "Tables",
		description: "Simple, tabular format. Each row represents a single record."
	},
	Cube: {
		type: "Cube",
		icon: "icon-db-datacube-02",
		groomer: CubeGroomer,
		mainElement: CubeMain,
		configElement: CubeConfig,
		inlineConfigElement: CubeInlineConfig,
		category: "Tables",
		description: "Dynamic table with configurable row and column grouping."
	},
	Calendar: {
		type: "Calendar",
		icon: "icon-calendar-empty",
		mainElement: CalendarMain,
		configElement: CalendarConfig,
		groomer: CalendarGroomer,
		category: "Dates and Times",
		description: "Lays out your data on a calendar."
	},
	Timeline : {
		type: "Timeline",
		icon: "icon-chart-bars-6",
		category: "Dates and Times",
		description: "Also called a Gannt chart.  Shows events and activities along a horizontal time axis."
	}
}

export default viewTypes
