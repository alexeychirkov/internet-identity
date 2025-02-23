/// Internet Identity types compatible on the candid interface.
/// The compatibility is maintained manually.
/// Once the support for generating rust types from candid is improved (see https://github.com/dfinity/candid/issues/255)
/// this module will be generated from the candid interface.
pub mod types;

/// Helpful data conversions for the types.
pub mod conversions;

/// Anchor activity counter trait and implementations thereof.
pub mod anchor_activity_counter;

/// Helpful implementations on the device data type.
pub mod device_data;
