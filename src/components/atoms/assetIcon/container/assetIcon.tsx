import React from 'react';
import { View, ViewStyle } from 'react-native';
import FastImage from 'react-native-fast-image';
import styles from '../styles/assetIcon.styles';
import HIVE_ENGINE_ICON from '../../../../assets/hive_engine.png';
import HBD_ICON from '../../../../assets/hbd_icon.png';
import HIVE_ICON from '../../../../assets/hive_icon.png';
import ECENCY_ICON from '../../../../assets/ecency-logo.png';
import { ASSET_IDS } from '../../../../constants/defaultAssets';

interface AssetIconProps {
  id: string;
  iconUrl?: string;
  isEngine?: boolean;
  iconSize?: number;
  containerStyle?: ViewStyle;
}

export const AssetIcon = ({ id, iconUrl, isEngine, containerStyle, iconSize }: AssetIconProps) => {
  if (iconSize) {
  }

  const _logoStyle = iconSize ? { ...styles.logo, width: iconSize, height: iconSize } : styles.logo;

  let _iconSource = iconUrl && { uri: iconUrl };
  if (!_iconSource) {
    switch (id) {
      case ASSET_IDS.HBD:
        _iconSource = HBD_ICON;
        break;
      case ASSET_IDS.HIVE:
      case ASSET_IDS.HP:
        _iconSource = HIVE_ICON;
        break;
      case ASSET_IDS.ECENCY:
        _iconSource = ECENCY_ICON;
        break;
    }
  }

  if (!_iconSource) {
    return null;
  }

  return (
    <View style={containerStyle}>
      <FastImage style={_logoStyle} resizeMode="contain" source={_iconSource} />
      {isEngine && (
        <View style={styles.hiveEngineWrapper}>
          <FastImage style={styles.hiveEngineLogo} resizeMode="contain" source={HIVE_ENGINE_ICON} />
        </View>
      )}
    </View>
  );
};
