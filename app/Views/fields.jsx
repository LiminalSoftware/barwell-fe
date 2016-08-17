
// import hasManyField from './Fields/HasManyField'
// import manyToManyField from './Fields/ManyToManyField'
import hasOneField from './Fields/FieldDefinitions/hasOneField'
import colorField from './Fields/FieldDefinitions/colorField'
import integerField from './Fields/FieldDefinitions/integerField'
import decimalField from './Fields/FieldDefinitions/decimalField'
import textField from './Fields/FieldDefinitions/textField'
import dateField from './Fields/FieldDefinitions/dateField'
import booleanField from './Fields/FieldDefinitions/booleanField'
import primaryKeyField from './Fields/FieldDefinitions/primaryKeyField'



var fieldTypes = {
	PRIMARY_KEY: primaryKeyField,
	TEXT: textField,
	BOOLEAN: booleanField,
	HAS_ONE: hasOneField,
	// HAS_MANY: hasManyField,
	// MANY_TO_MANY: manyToManyField,
	COLOR: colorField,
	INTEGER: integerField,
	DECIMAL: decimalField,
	DATE: dateField
}

export default fieldTypes;
