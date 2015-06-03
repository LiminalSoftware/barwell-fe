import TabularConfig from "./Tabular/Config/index.jsx"
import TabularMain from "./Tabular/Main/index.jsx"
import CalendarConfig from "./Calendar/Config/index.jsx"
import CalendarMain from "./Calendar/Main/index.jsx"


var viewTypes = {
	Tabular: {
		type: "Tabular",
		icon: "icon-db-datasheet",
		mainElement: TabularMain,
		configElement: TabularConfig,
		category: "Tables",
		description: "Just a plain old table of data.  Each object is one row in the table."
	},
	Cube: {
		type: "Cube",
		icon: "icon-db-datacube-02",
		category: "Tables",
		description: "Dynamic table with rows and columns grouped as you please."
	},
	Calendar: {
		type: "Calendar",
		icon: "icon-calendar-empty",
		mainElement: CalendarMain,
		configElement: CalendarConfig,
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