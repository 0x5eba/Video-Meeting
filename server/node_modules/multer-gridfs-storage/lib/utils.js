/**
 *
 * Utility functions
 * @module multer-gridfs-storage/utils
 *
 */
const isPlainObject = require('lodash.isplainobject');

/**
 * Compare two objects by value.
 *
 * This function is designed taking into account how mongodb connection parsing routines work.
 * @param {any} obj1 The target object to compare
 * @param {any} obj2 The second object to compare with the first
 * @return {boolean} Return true if both objects are equal by value
 */
function compare(obj1, obj2) {
	let prop;
	let comp;
	let val1;
	let val2;
	let keys1 = 0;
	let keys2 = 0;

	// If objects are equal by identity stop testing
	if (obj1 === obj2) {
		return true;
	}

	// Falsey and plain objects with no properties are equivalent
	if (!obj1 || !obj2) {
		if (!obj1 && !obj2) {
			return true;
		}

		return !(obj1 ? hasKeys(obj1) : hasKeys(obj2));
	}

	// Check both own and inherited properties, MongoDb doesn't care where the property was defined
	/* eslint-disable-next-line guard-for-in */
	for (prop in obj1) {
		val1 = obj1[prop];
		val2 = obj2[prop];
		// If one object has one property not present in the other they are different
		if (prop in obj2) {
			comp = compareBy(val1, val2);
			switch (comp) {
				case 'object':
					// If both values are plain objects recursively compare its properties
					if (!compare(val1, val2)) {
						return false;
					}

					break;
				case 'array':
					// If both values are arrays compare buffers and strings by content and every other value by identity
					if (!compareArrays(val1, val2)) {
						return false;
					}

					break;
				case 'buffer':
					// If both values are buffers compare them by content
					if (Buffer.compare(val1, val2) !== 0) {
						return false;
					}

					break;
				default:
					// All other values are compared by identity
					if (val1 !== val2) {
						return false;
					}

					break;
			}

			keys1++;
		} else {
			return false;
		}
	}

	// Count all properties from the target object
	/* eslint-disable-next-line guard-for-in */
	for (prop in obj2) {
		keys2++;
	}

	// If the target object has more properties than source they are different
	return keys1 === keys2;
}

/**
 * Compare arrays by reference unless the values are strings or buffers
 * @param arr1 The source array to compare
 * @param arr2 The target array to compare with
 * @return {boolean} Returns true if both arrays are equivalent
 */
function compareArrays(arr1, arr2) {
	let val1;
	let val2;
	let i;
	if (arr1.length !== arr2.length) {
		return false;
	}

	for (i = 0; i < arr1.length; i++) {
		val1 = arr1[i];
		val2 = arr2[i];
		// Types other than string or buffers are compared by reference because MongoDb only accepts those two types
		// for configuration inside arrays
		if (compareBy(val1, val2) === 'buffer') {
			if (Buffer.compare(val1, val2) !== 0) {
				return false;
			}
		} else if (val1 !== val2) {
			return false;
		}
	}

	return true;
}

/**
 * Indicates how objects should be compared.
 * @param obj1 The source object to compare
 * @param obj2 The target object to compare with
 * @return {string} Always returns 'identity' unless both objects have the same type and they are plain objects, arrays
 * or buffers
 */
function compareBy(obj1, obj2) {
	if (isPlainObject(obj1) && isPlainObject(obj2)) {
		return 'object';
	}

	if (Array.isArray(obj1) && Array.isArray(obj2)) {
		return 'array';
	}

	if (Buffer.isBuffer(obj1) && Buffer.isBuffer(obj2)) {
		return 'buffer';
	}

	// All values are compared by identity unless they are both arrays, buffers or plain objects
	return 'identity';
}

/**
 * Return true if the object has at least one property inherited or not
 * @param obj The object to inspect
 * @return {boolean} If the object has any properties or not
 */
function hasKeys(obj) {
	/* eslint-disable-next-line guard-for-in */
	for (const prop in obj) {
		// Stop testing if the object has at least one property
		return true;
	}

	return false;
}

/**
 * Compare two parsed uris checking if they are equivalent
 * @param {*} uri1 The source parsed uri
 * @param {*} uri2 The target parsed uri to compare
 * @return {boolean} Return true if both uris are equivalent
 */
function compareUris(uri1, uri2) {
	// Compare properties that are string values
	const strProps = ['scheme', 'username', 'password', 'database'];
	const diff = strProps.find(prop => uri1[prop] !== uri2[prop]);
	if (diff) {
		return false;
	}

	// Compare query parameter values
	if (!compare(uri1.options, uri2.options)) {
		return false;
	}

	const hosts1 = uri1.hosts;
	const hosts2 = uri2.hosts;
	// Check if both uris have the same number of hosts
	if (hosts1.length !== hosts2.length) {
		return false;
	}

	// Check if every host in one array is present on the other array no matter where is positioned
	for (const hostObj of hosts1) {
		if (!hosts2.find(h => h.host === hostObj.host && h.port === hostObj.port)) {
			return false;
		}
	}

	return true;
}

/**
 * Checks if an object is a mongoose instance, a connection or a mongo Db object
 * @param {*} obj The object to check
 * @return {Db} The database object
 */
function getDatabase(obj) {
	// If the object has a db property should be a mongoose connection instance
	// Mongo 2 has a db property but its a function. See issue #14
	if (obj.db && typeof obj.db !== 'function') {
		return obj.db;
	}

	// If it has a connection property with a db property on it is a mongoose instance
	if (obj.connection && obj.connection.db) {
		return obj.connection.db;
	}

	// If none of the above are true it should be a mongo database object
	return obj;
}

module.exports = {
	compare,
	hasKeys,
	compareArrays,
	compareBy,
	compareUris,
	getDatabase
};
