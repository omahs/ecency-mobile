import React from 'react';
import { View, Text, TouchableHighlight } from 'react-native';

// External components
import ModalDropdown from 'react-native-modal-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Styles
import styles from './dropdownButtonStyles';

/* Props TODO: Fill all description
 * ------------------------------------------------
 *   @prop { string }      defaultText         - Description....
 *   @prop { string }      iconName            - Description....
 *   @prop { array }       options             - Description....
 *   @prop { function }    onSelect            - Description....
 *
 */

const renderDropdownRow = (rowData, rowID, highlighted, rowTextStyle, noHighlight) => (
  <TouchableHighlight style={styles.rowWrapper} underlayColor="#E9F2FC">
    <View style={[styles.dropdownRow, !noHighlight && highlighted && styles.highlightedRow]}>
      <Text
        style={[
          rowTextStyle || styles.rowText,
          !noHighlight && highlighted && styles.highlightedRowText,
        ]}
      >
        {rowData}
      </Text>
    </View>
  </TouchableHighlight>
);

const DropdownButtonView = ({
  childIconWrapperStyle,
  children,
  defaultText,
  iconStyle,
  iconName,
  isHasChildIcon,
  onSelect,
  dropdownStyle,
  dropdownTextStyle,
  dropdownButtonStyle,
  textStyle,
  rowTextStyle,
  selectedOptionIndex,
  options,
  style,
  noHighlight,
}) => (
  <View style={[styles.container, dropdownButtonStyle]}>
    <ModalDropdown
      style={[!style ? styles.button : style]}
      textStyle={[textStyle || styles.buttonText]}
      dropdownStyle={[styles.dropdown, dropdownStyle, { height: 35 * (options.length + 1) }]}
      dropdownTextStyle={[dropdownTextStyle || styles.dropdownText]}
      dropdownTextHighlightStyle={styles.dropdownTextHighlight}
      options={options}
      onSelect={e => onSelect && onSelect(e)}
      defaultIndex={selectedOptionIndex}
      defaultValue={defaultText}
      renderSeparator={() => null}
      renderRow={(rowData, rowID, highlighted) => renderDropdownRow(rowData, rowID, highlighted, rowTextStyle, noHighlight)
      }
    >
      {isHasChildIcon && (
        <View style={[styles.iconWrapper, childIconWrapperStyle && childIconWrapperStyle]}>
          <Ionicons
            style={[styles.dropdownIcon, iconStyle]}
            name={!iconName ? 'md-arrow-dropdown' : iconName}
          />
        </View>
      )}
    </ModalDropdown>
    {!children && !isHasChildIcon && (
      <View style={styles.iconWrapper}>
        <Ionicons style={styles.dropdownIcon} name={!iconName ? 'md-arrow-dropdown' : iconName} />
      </View>
    )}
  </View>
);

export default DropdownButtonView;
