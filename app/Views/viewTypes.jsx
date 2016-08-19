import TableConfig from "./Tabular/ViewConfigBar"
import TabularMain from "./Tabular/Main/index.jsx"
import TabularGroomer from "./Tabular/groom"

import HistoryMain from "./ChangeHistory/index.jsx"

import CalendarMain from "./Calendar/Main/index.jsx"
import CalendarGroomer from "./Calendar/groom.jsx"

import CubeConfig from "./Cube/ViewConfigBar"
import CubeMain from "./Cube/Main/index.jsx"
import CubeGroomer from "./Cube/groom"

import VennInlineConfig from "./Venn/InlineConfig/index.jsx"
import VennMain from "./Venn/Main/index.jsx"
import VennGroomer from "./Venn/groom"



var viewTypes = {
	// History: {
	// 	type: "History",
	// 	icon: "icon-history2",
	// 	groomer: TabularGroomer,
	// 	mainElement: HistoryMain,
	// 	category: "Tables",
	// 	description: ""
	// },
	Table: {
		type: "Table",
		icon: "icon-grid",
		groomer: TabularGroomer,
		mainElement: TabularMain,
		configElement: TableConfig,
		category: "Tables",
		description: "Simple, tabular format. Each row represents a single record."
	},
	Cube: {
		type: "Cube",
		icon: "icon-cube",
		groomer: CubeGroomer,
		mainElement: CubeMain,
		configElement: CubeConfig,
		category: "Tables",
		description: "Dynamic table with configurable row and column grouping."
	},
	Calendar: {
		type: "Calendar",
		icon: "icon-calendar-full",
		mainElement: CalendarMain,
		groomer: CalendarGroomer,
		category: "Dates and Times",
		description: "Shows events on a calendar."
	},
	Timeline : {
		type: "Timeline",
		icon: "icon-road",
		category: "Dates and Times",
		description: "Shows events and activities along a horizontal time axis."
	},
	"Venn Diagram": {
		type: "Venn Diagram",
		mainElement: VennMain,
		inlineConfigElement: VennInlineConfig,
		groomer: VennGroomer,
		icon: "icon-exclude",
		category: "Diagrams",
		description: "Shows set membership visually"
	}
}

export default viewTypes
